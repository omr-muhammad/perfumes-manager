import { db } from "../../../db/config";
import { perfumesCompoundsTable } from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type { CreateCompoundBody } from "./schema";

export async function create(
  ownerId: number,
  shopId: number,
  newComp: CreateCompoundBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const mlPrice = Math.ceil(newComp.kiloSellPrice / 1000);

    const [compound] = await db
      .insert(perfumesCompoundsTable)
      .values({
        ...newComp,
        kiloBuyPrice: newComp.kiloBuyPrice.toFixed(4),
        kiloSellPrice: newComp.kiloSellPrice.toFixed(4),
        mlPrice: mlPrice.toFixed(4),
        shopId,
      })
      .returning();

    return compound;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}
