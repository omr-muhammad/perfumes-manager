import { sql } from "drizzle-orm";
import { db } from "../config";
import { setupAlcoholTriggers } from "./syncAlcohol";

export async function dbFunctions() {
  await setupAlcoholTriggers();
  await decreaseBottlesStock();
  await decreasePerfumesStock();
}

async function decreaseBottlesStock() {
  await db.execute(sql`
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
                                WHEN remaining_amount <= 0 THEN 'depleted'
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
    `);
}

async function decreasePerfumesStock() {
  await db.execute(sql`
        CREATE OR REPLACE FUNCTION _deduct_compound_lots(
            p_compound_id INT,
            p_oil_to_deduct INT,
            p_spray_to_deduct INT
        )
        RETURNS VOID
        LANGUAGE plpgsql
        AS $$
            DECLARE
                v_remaining_oil_to_deduct INT := p_oil_to_deduct;
                v_remaining_spray_to_deduct INT := p_spray_to_deduct;
                v_oil_take INT;
                v_spray_take INT;
                v_lot RECORD;
            BEGIN
                FOR v_lot IN
                SELECT id, remaining_oil_amount, remaining_spray_amount
                FROM compound_lots AS lots
                WHERE 
                    lots.compound_id = p_compound_id
                    AND status IN('inuse', 'ready')
                    AND (remaining_oil_amount > 0 OR remaining_spray_amount > 0)
                ORDER BY 
                    CASE status WHEN 'inuse' THEN 0 ELSE 1 END,
                    received_at ASC -- oldest first
                FOR UPDATE

                LOOP
                    EXIT WHEN 
                        v_remaining_oil_to_deduct <= 0 AND v_remaining_spray_to_deduct <= 0;
                    
                    v_oil_take := LEAST(v_remaining_oil_to_deduct, v_lot.remaining_oil_amount);
                    v_spray_take := LEAST(v_remaining_spray_to_deduct, v_lot.remaining_spray_amount);

                    UPDATE compound_lots
                    SET 
                        remaining_oil_amount = remaining_oil_amount - v_oil_take,
                        remaining_spray_amount = remaining_spray_amount - v_spray_take,
                        status = 
                            CASE 
                                WHEN 
                                    (remaining_oil_amount - v_oil_take) <= 0 
                                    AND (remaining_spray_amount - v_spray_take) <= 0 
                                    THEN 'depleted'
                                WHEN 'ready' THEN 'inuse'
                                ELSE status
                            END
                    WHERE id = v_lot.id;

                    v_remaining_oil_to_deduct := v_remaining_oil_to_deduct - v_oil_take;
                    v_remaining_spray_to_deduct := v_remaining_spray_to_deduct - v_spray_take;
                END LOOP;


                -- Throw error if loops end while remaining to deduct
                IF v_remaining_oil_to_deduct > 0 OR v_remaining_spray_to_deduct > 0 THEN
                    RAISE EXCEPTION 'Not enough compound stock. Short by % ml oil & Short by % ml spray', v_remaining_oil_to_deduct, v_remaining_spray_to_deduct;
                END IF;
            END;
        $$;
    `);
}
