import { sql } from "drizzle-orm";
import { db } from "../config";
import { setupAlcoholTriggers } from "./syncAlcohol";

export async function triggers() {
  await setupAlcoholTriggers();
  await decreaseBottlesStock();
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
