import { and, eq } from "drizzle-orm";
import { db } from "../../../db/config";
import { bottlesTable, shopsTable } from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type { CreateBottleBody, UpdateBottleBody } from "./schema";

export async function create(
  ownerId: number,
  shopId: number,
  bottle: CreateBottleBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const [newBottle] = await db
      .insert(bottlesTable)
      .values({
        ...bottle,
        price: bottle.price.toFixed(2),
        shopId,
      })
      .returning();

    return newBottle;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function update(
  ownerId: number,
  shopId: number,
  bottleId: number,
  updates: UpdateBottleBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const [bottle] = await db
      .update(bottlesTable)
      .set({
        ...(updates.name && { name: updates.name }),
        ...(updates.type && { type: updates.type }),
        ...(updates.category && { category: updates.category }),
        ...(updates.size && { size: updates.size }),
        ...(updates.price && { price: updates.price.toFixed(2) }),
        ...(updates.img && { img: updates.img }),
        updatedAt: new Date(),
      })
      .where(
        and(eq(bottlesTable.id, bottleId), eq(bottlesTable.shopId, shopId)),
      )
      .returning();

    return bottle;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function remove(
  ownerId: number,
  shopId: number,
  bottleId: number,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const [bottle] = await db
      .delete(bottlesTable)
      .where(
        and(eq(bottlesTable.id, bottleId), eq(bottlesTable.shopId, shopId)),
      )
      .returning();

    return bottle;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function queryAll(ownerId: number, shopId: number) {
  try {
    const shop = await assertOwnership(shopId, ownerId);

    const bottles = await db
      .select()
      .from(bottlesTable)
      .where(eq(bottlesTable.shopId, shopId));

    return { bottles, shop };
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function queryById(
  ownerId: number,
  shopId: number,
  btlId: number,
) {
  try {
    const shop = await assertOwnership(shopId, ownerId);

    const [bottle] = await db
      .select()
      .from(bottlesTable)
      .where(and(eq(bottlesTable.shopId, shopId), eq(bottlesTable.id, btlId)));

    return { bottle, shop };
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}
