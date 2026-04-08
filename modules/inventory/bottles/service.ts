import { db } from "../../../db/config";
import { bottlesTable } from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type { CreateBottleBody } from "./schema";

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
