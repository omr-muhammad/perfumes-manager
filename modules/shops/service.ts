import { and, eq } from "drizzle-orm";
import { db } from "../../db/config";
import { shopsTable } from "../../db/schema";

// HELPERS
async function assertOwnership(shopId: number, ownerId: number) {
  const [shop] = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.id, shopId));

  if (!shop) throw new Error("Shop not found.");

  if (shop.ownerId !== ownerId)
    throw new Error(
      `Shop with id: ${shop.id} does not belong to user with id: ${ownerId}`,
    );

  return shop;
}
