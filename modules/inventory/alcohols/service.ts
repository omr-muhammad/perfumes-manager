import { and, eq } from "drizzle-orm";
import { db } from "../../../db/config";
import { alcoholsTable } from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type { CreateAlcoBody, UpdateAlcoBody } from "./schema";

// try {

// } catch (e: any) {
//   console.log("Error: ", e);
//   console.log("Error Cause: ", e.cause);
//   throw e;
// }

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
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.type ? { type: updates.type } : {}),
        ...(updates.concentration
          ? { concentration: updates.concentration }
          : {}),
        ...(updates.ltBuyPrice
          ? { ltBuyPrice: updates.ltBuyPrice.toFixed(2) }
          : {}),
        ...(updates.ltSellPrice
          ? { ltSellPrice: updates.ltSellPrice.toFixed(2) }
          : {}),
        ...(updates.ltSellPrice
          ? { unitSellPrice: (updates.ltSellPrice / 1000).toFixed(2) }
          : {}),
        ...(updates.amountInMl ? { amountInMl: updates.amountInMl } : {}),
        ...(updates.expiryDate
          ? { expiryDate: new Date(updates.expiryDate) }
          : {}),
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
