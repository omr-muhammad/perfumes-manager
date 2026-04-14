import { and, eq, sql, TransactionRollbackError } from "drizzle-orm";
import { db } from "../../../db/config";
import { alcoholsTable, shopsTable } from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type { CreateAlcoBody, UpdateAlcoBody } from "./schema";
import type { DbTx } from "../../../utils/globalSchema";

export async function create(
  ownerId: number,
  shopId: number,
  newAlco: CreateAlcoBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const unitSellPrice = Math.ceil(newAlco.ltSellPrice / 1000);

    const [alcohol] = await db
      .insert(alcoholsTable)
      .values({
        ...newAlco,
        ltBuyPrice: newAlco.ltBuyPrice.toFixed(2),
        ltSellPrice: newAlco.ltSellPrice.toFixed(2),
        unitSellPrice: unitSellPrice.toFixed(2),
        expiryDate: new Date(newAlco.expiryDate),
        shopId,
      })
      .returning();

    if (!alcohol) throw new Error("Failed to create new alcohol");

    return alcohol;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function update(
  ownerId: number,
  shopId: number,
  alcoholId: number,
  updates: UpdateAlcoBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const [alcohol] = await db
      .update(alcoholsTable)
      .set({
        ...(updates.name && { name: updates.name }),
        ...(updates.type && { type: updates.type }),
        ...(updates.concentration && { concentration: updates.concentration }),
        ...(updates.ltBuyPrice && {
          ltBuyPrice: updates.ltBuyPrice.toFixed(2),
        }),
        ...(updates.ltSellPrice && {
          ltSellPrice: updates.ltSellPrice.toFixed(2),
        }),
        ...(updates.ltSellPrice && {
          unitSellPrice: Math.ceil(updates.ltSellPrice / 1000).toFixed(2),
        }),
        ...(updates.amountInMl && { amountInMl: updates.amountInMl }),
        ...(updates.expiryDate && { expiryDate: new Date(updates.expiryDate) }),
        updatedAt: new Date(),
      })
      .where(
        and(eq(alcoholsTable.shopId, shopId), eq(alcoholsTable.id, alcoholId)),
      )
      .returning();

    return alcohol;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function remove(
  ownerId: number,
  shopId: number,
  alcoholId: number,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const [alcohol] = await db
      .delete(alcoholsTable)
      .where(
        and(eq(alcoholsTable.shopId, shopId), eq(alcoholsTable.id, alcoholId)),
      )
      .returning();

    return alcohol;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function queryAll(ownerId: number, shopId: number) {
  try {
    await assertOwnership(shopId, ownerId);

    const alcohols = await db
      .select()
      .from(alcoholsTable)
      .innerJoin(shopsTable, eq(shopsTable.id, alcoholsTable.shopId))
      .where(eq(alcoholsTable.shopId, shopId));

    return alcohols;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function queryById(
  ownerId: number,
  shopId: number,
  alcoholId: number,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const [alcohol] = await db
      .select()
      .from(alcoholsTable)
      .innerJoin(shopsTable, eq(shopsTable.id, alcoholsTable.shopId))
      .where(eq(alcoholsTable.id, alcoholId));

    return alcohol;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function increaseStock(
  alcoholId: number,
  amount: number,
  higherTx?: DbTx,
) {
  try {
    const _db = higherTx ?? db;
    const [alcohol] = await _db
      .update(alcoholsTable)
      .set({
        amountInMl: sql`${alcoholsTable.amountInMl} + ${Math.abs(amount)}`,
      })
      .where(eq(alcoholsTable.id, alcoholId))
      .returning();

    return alcohol;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);

    if (e instanceof TransactionRollbackError) {
      throw e; // re-throw → bubbles up → outer rolls back
    }

    throw e;
  }
}

export async function decreaseStock(
  amounts: { alcoholId: number; amountInMl: number }[],
  higherTx?: DbTx,
) {
  try {
    const _db = higherTx ?? db;
    const result = (await _db.transaction(async (tx) => {
      const decrementsTable = sql.join(
        amounts.map(
          (obj) => sql`(${obj.alcoholId}, ${Math.abs(obj.amountInMl)})`,
        ),
        sql`, `,
      );

      const rows = await tx.execute(sql`
        UPDATE alcohols AS alco
        
        SET amount_in_ml = amount_in_ml - decs.amount
        
        FROM (VALUES ${decrementsTable} AS decs(alco_id, amount))
        
        WHERE alco.id = decs.alco_id
          AND alco.amount_in_ml >= decs.amount
        
        RETURNING alco.id AS id, alco.amount_in_ml AS "amountInMl" 
      `);

      if (rows.length !== amounts.length) tx.rollback();

      return result;
    })) as { id: number; amountInMl: number }[];

    return result;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);

    if (e instanceof TransactionRollbackError) {
      throw e; // re-throw → bubbles up → outer rolls back
    }

    throw e;
  }
}
