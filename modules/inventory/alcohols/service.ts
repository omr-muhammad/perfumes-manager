import { db } from "../../../db/config";
import { alcoholsTable } from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type { CreateAlcoBody } from "./schema";

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
