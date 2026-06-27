import { sql } from "drizzle-orm";

export const decreaseBottlesStock = sql`
	CREATE OR REPLACE FUNCTION _deduct_bottles_lots(
    p_bottle_id INT,
    p_stock_to_deduct INT
  )
  RETURNS VOID
  LANGUAGE plpgsql
  AS $$
    DECLARE
      v_lot RECORD;
      v_remaining_to_deduct INT := p_stock_to_deduct;
      v_take INT;
    BEGIN
        FOR v_lot IN
        SELECT id, remaining_stock
        FROM bottles_lots AS lots
        WHERE 
            lots.status IN ('inuse', 'ready') 
            AND lots.remaining_stock > 0
            AND lots.bottle_id = p_bottle_id
        ORDER BY 
            CASE status WHEN 'inuse' THEN 0 ELSE 1 END,
            received_at ASC
        FOR UPDATE

          LOOP
              EXIT WHEN v_remaining_to_deduct <= 0;

              v_take := LEAST(v_lot.remaining_stock, v_remaining_to_deduct);

              UPDATE bottles_lots
              SET 
                  remaining_stock = remaining_stock - v_take,
                  status = 
                      CASE 
                          WHEN remaining_stock <= 0 THEN 'depleted'
                          WHEN status = 'ready' THEN 'inuse'
                          ELSE status
                      END
              WHERE id = v_lot.id;

              v_remaining_to_deduct := v_remaining_to_deduct - v_take;
          END LOOP;

          -- Throw error if loops end while remaining to deduct
          IF v_remaining_to_deduct > 0 THEN
              RAISE EXCEPTION 'Not enough bottle stock. Short by % ml', v_remaining_to_deduct;
          END IF;
      END;
  $$;
`;

export const decreaseCompoundsStock = sql`
  CREATE OR REPLACE FUNCTION _deduct_shop_compound_lots(
    p_compound_id INT,
    p_gm_oil_to_deduct NUMERIC,
    p_ml_oil_to_deduct NUMERIC,
    p_spray_to_deduct NUMERIC
  )
  RETURNS VOID
  LANGUAGE plpgsql
  AS $$
      DECLARE
        v_rm_gm_oil NUMERIC := p_gm_oil_to_deduct;
        v_rm_ml_oil NUMERIC :=  p_ml_oil_to_deduct;
        v_rm_spray NUMERIC := p_spray_to_deduct;
        v_total_gm NUMERIC;
        v_ml_to_gm NUMERIC;
        v_oil_take NUMERIC;
        v_gm_take NUMERIC;
        v_ml_take NUMERIC;
        v_spray_take NUMERIC;
        v_lot RECORD;
      BEGIN
        FOR v_lot IN
        SELECT id, remaining_oil_amount, remaining_spray_amount, density_snapshot
        FROM shop_compound_lots AS lots
        WHERE 
            lots.compound_id = p_compound_id
            AND status IN('inuse', 'ready')
            AND (remaining_oil_amount > 0 OR remaining_spray_amount > 0)
        ORDER BY 
            CASE status WHEN 'inuse' THEN 0 ELSE 1 END,
            received_at ASC -- oldest first
        FOR UPDATE

        LOOP
          EXIT 
            WHEN v_rm_gm_oil <= 0 AND v_rm_ml_oil <= 0 AND v_rm_spray <= 0;
          
          -- Sum all oil deduction in gm
          v_ml_to_gm := v_rm_ml_oil * v_lot.density_snapshot;
          v_total_gm := v_ml_to_gm + v_rm_gm_oil;

          -- Get what to deduct
          v_oil_take := LEAST(v_total_gm, v_lot.remaining_oil_amount);

          -- Split what we take from gm first then portion from ml
          v_gm_take := LEAST(v_oil_take, v_rm_oil_to_deduct);
          v_ml_take := (v_oil_take - v_gm_take) / v_lot.density_snapshot;

          -- Decrease each with actual taken
          v_rm_gm_oil := v_rm_gm_oil - v_gm_take;
          v_rm_ml_oil := v_rm_ml_oil - v_ml_take;

          -- Spray
          v_spray_take := LEAST(v_rm_spray, v_lot.remaining_spray_amount);
          v_rm_spray := v_rm_spray - v_spray_take;

          UPDATE shop_compound_lots
          SET 
            remaining_oil_amount = remaining_oil_amount - v_oil_take,
            remaining_spray_amount = remaining_spray_amount - v_spray_take,
            status = 
                CASE 
                    WHEN 
                        (remaining_oil_amount - v_oil_take) <= 0 
                        AND (remaining_spray_amount - v_spray_take) <= 0 
                        THEN 'depleted'
                    WHEN status = 'ready' THEN 'inuse'
                    ELSE status
                END
          WHERE id = v_lot.id;
        END LOOP;

        -- Throw error if loops end while remaining to deduct
        IF v_rm_gm_oil > 0 OR v_rm_ml_oil > 0 OR v_rm_spray > 0 THEN
          RAISE EXCEPTION 
            'Not enough compound stock. Short by % gm oil & Short by % ml oil & Short by % ml spray', 
            v_rm_gm_oil, v_rm_ml_oil, v_rm_spray;
        END IF;
      END;
  $$;
`;
