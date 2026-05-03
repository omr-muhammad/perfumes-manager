import { sql } from "drizzle-orm";
import { db } from "../config";

export async function setupAlcoholTriggers() {
  // Create trigger for compound_lots and agings
  await createSyncAlcoTriggers();

  // Attach Triggers
  await attachTriggers();
}

// Helpers
async function createSyncAlcoTriggers() {
  await _deduct_alcohol_lots();
  await _return_alcohol_lots();
  await _applyAlcoholSync();

  await db.execute(sql`
    CREATE OR REPLACE FUNCTION sync_alcohol()
    RETURNS TRIGGER LANGUAGE plpgsql AS $$
    DECLARE 
      should_sync BOOLEAN;
      old_amount INT;
      new_amount INT;
    BEGIN
      should_sync := COALESCE(current_setting('app.should_sync', true), true);

      IF NOT should_sync THEN RETURN NEW;
      END IF;

      IF TG_TABLE_NAME = 'compound_lots' THEN
        old_amount := OLD.spray_amount_ml;
        new_amount := NEW.spray_amount_ml;
      ELSIF TG_TABLE_NAME = 'agings' THEN
        old_amount := OLD.amount;
        new_amount := NEW.amount;
      END IF;

      PERFORM _apply_alcohol_sync(
        TG_OP,
        old_amount,
        new_amount,
        OLD.concentration,
        NEW.concentration,
        OLD.alcohol_id,
        NEW.alcohol_id
      );

      IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;

      RETURN NEW;
    END;
    $$
  `);
}

async function attachTriggers() {
  await db.execute(sql`
    CREATE OR REPLACE TRIGGER trg_lot_alcohol_sync
    AFTER INSERT OR UPDATE OR DELETE ON compound_lots
    FOR EACH ROW EXECUTE FUNCTION sync_alcohol()
  `);

  await db.execute(sql`
    CREATE OR REPLACE TRIGGER trg_aging_alcohol_sync
    AFTER INSERT OR UPDATE OR DELETE ON agings
    FOR EACH ROW EXECUTE FUNCTION sync_alcohol()
  `);
}

// Internal database helper functions
async function _deduct_alcohol_lots() {
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION _deduct_alcohol_lots(
      p_alcohol_id INT,
      p_amount_to_deduct INT
    )
    RETURNS VOID
    LANGUAGE plpgsql
    AS $$
    DECLARE  
      v_alco_lot RECORD;
      v_remaining_to_deduct INT := p_amount_to_deduct;
      v_take INT;
      
    BEGIN
      FOR v_alco_lot IN
        SELECT id, remaining_amount
        FROM alcohol_lots
        WHERE alcohol_id = p_alcohol_id 
          AND status IN ('inuse', 'ready') 
          AND remaining_amount > 0
        ORDER BY CASE status WHEN 'inuse' THEN 0 ELSE 1 END, received_at ASC
        FOR UPDATE -- lock selected until finish
        LOOP
          EXIT WHEN v_remaining_to_deduct <= 0;

          v_take := LEAST(v_remaining_to_deduct, v_alco_lot.remaining_amount);

          UPDATE alcohol_lots
          SET 
            remaining_amount = remaining_amount - v_take,
            status = 
              CASE 
                WHEN remaining_amount - v_take <= 0 THEN 'depleted'
                WHEN status = 'ready'      THEN 'inuse'
                ELSE status
              END
          WHERE id = v_alco_lot.id;

          v_remaining_to_deduct := v_remaining_to_deduct - v_take;
        END LOOP;

      -- Throw error if loops end while remaining to deduct
      IF v_remaining_to_deduct > 0 THEN
        RAISE EXCEPTION 'Not enough alcohol stock. Short by % ml', v_remaining_to_deduct;
      END IF;

    END;
    $$;
  `);
}

async function _return_alcohol_lots() {
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION _return_alcohol_lots(
      p_alcohol_id INT,
      p_amount_to_return INT
    )
    RETURNS VOID
    LANGUAGE plpgsql
    AS $$
    DECLARE  
      v_alco_lot RECORD;
      v_remaining_to_return INT := p_amount_to_return;
      v_give INT;
      
    BEGIN
      FOR v_alco_lot IN
        SELECT id, remaining_amount, amount, status
        FROM alcohol_lots
        WHERE alcohol_id = p_alcohol_id 
          AND status IN ('inuse', 'depleted') 
        ORDER BY CASE status WHEN 'inuse' THEN 0 ELSE 1 END, received_at DESC
        FOR UPDATE -- lock selected until finish
        LOOP
          EXIT WHEN v_remaining_to_return <= 0;

          v_give := LEAST(v_alco_lot.amount - v_alco_lot.remaining_amount, v_remaining_to_return);

          UPDATE alcohol_lots
          SET 
            remaining_amount = remaining_amount + v_give,
            status = 'inuse'
          WHERE id = v_alco_lot.id;

          v_remaining_to_return := v_remaining_to_return - v_give;
        END LOOP;

      -- Throw error if loops end while remaining to deduct
      IF v_remaining_to_return > 0 THEN
        RAISE EXCEPTION 'Could not fully return % ml to alcohol_id %', v_remaining_to_return, p_alcohol_id;
      END IF;
    END;
    $$;
  `);
}

async function _applyAlcoholSync() {
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION _apply_alcohol_sync(
      tg_op TEXT,
      old_amount INT,
      new_amount INT,
      old_con NUMERIC,
      new_con NUMERIC,
      old_alcohol_id INT,
      new_alcohol_id INT
    )
    RETURNS VOID
    LANGUAGE plpgsql
    AS $$
    DECLARE
      old_actual_alcohol NUMERIC;
      new_actual_alcohol NUMERIC;
      net_diff NUMERIC;

    BEGIN

      IF tg_op = 'INSERT' THEN
        new_actual_alcohol := new_amount * (1 - new_con / 100);
        PERFORM _deduct_alcohol_lots(new_alcohol_id, new_actual_alcohol);

      ELSIF tg_op = 'DELETE' THEN
        old_actual_alcohol := old_amount * (1 - old_con / 100);
        PERFORM _return_alcohol_lots(old_alcohol_id, old_actual_alcohol);

      ELSIF tg_op = 'UPDATE' THEN
        
        IF old_amount = new_amount 
          AND old_con = new_con 
          AND old_alcohol_id = new_alcohol_id
        THEN RETURN;
        END IF;

        old_actual_alcohol := old_amount * (1 - old_con / 100);
        new_actual_alcohol := new_amount * (1 - new_con / 100);

        IF old_alcohol_id = new_alcohol_id THEN
          net_diff := new_actual_alcohol - old_actual_alcohol;
          
          IF net_diff > 0 THEN
            -- amount increase means alcohol decreased
            PERFORM _deduct_alcohol_lots(new_alcohol_id, net_diff);
          ELSIF net_diff < 0 THEN
            PERFORM _return_alcohol_lots(new_alcohol_id, ABS(net_diff));
          END IF;
        
        ELSE
          PERFORM _return_alcohol_lots(old_alcohol_id, old_actual_alcohol);
          PERFORM _deduct_alcohol_lots(new_alcohol_id, new_actual_alcohol);
        END IF; -- Ending alcohol_id checking

      END IF; -- Ending tg_op checking
    END;
    $$;
  `);
}
