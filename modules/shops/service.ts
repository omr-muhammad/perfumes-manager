import { and, eq } from "drizzle-orm";
import { db } from "../../db/config";
import { addressesTable, shopsTable, usersTable } from "../../db/schema";
import type { Address, CreateNewShopBody, NewShop } from "./schema";

export async function create(
  ownerId: number,
  newShop: NewShop,
  address?: Address,
) {
  await assertIsOwner(ownerId);

  const [shop] = await db
    .insert(shopsTable)
    .values({
      ...newShop,
      ownerId,
    })
    .returning();

  if (!address || !shop) return shop;

  const [add] = await db
    .insert(addressesTable)
    .values({
      ...address,
      shopId: shop.id,
    })
    .returning();

  return { ...shop, address: add };
}

// export async function update(shopId: number, ownerId: number, updates);

// HELPERS
async function assertIsOwner(userId: number) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) throw new Error("User not found");

  if (user.role !== "owner") throw new Error("Owner role required");

  return user;
}

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
