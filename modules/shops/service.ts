import { and, eq } from "drizzle-orm";
import { db } from "../../db/config";
import { addressesTable, shopsTable, usersTable } from "../../db/schema";
import type {
  Address,
  CreateShopBody,
  NewShop,
  UpdateAddressBody,
  UpdateShopBody,
} from "./schema";

export async function create(
  ownerId: number,
  newShop: NewShop,
  address?: Address,
) {
  try {
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
  } catch (e: any) {
    console.log("Error: ", e.cause);
    throw e;
  }
}

export async function update(
  shopId: number,
  ownerId: number,
  updates: UpdateShopBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const [shop] = await db
      .update(shopsTable)
      .set(updates)
      .where(and(eq(shopsTable.id, shopId), eq(shopsTable.ownerId, ownerId)))
      .returning();

    return shop;
  } catch (e: any) {
    console.log("Error: ", e.cause);
    throw e;
  }
}

export async function upsertShopAddress(
  shopId: number,
  ownerId: number,
  newAddress: UpdateAddressBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    let [address] = await db
      .update(addressesTable)
      .set(newAddress)
      .where(eq(addressesTable.shopId, shopId))
      .returning();

    if (!address) {
      if (!newAddress.country || !newAddress.city || !newAddress.street)
        throw new Error("Missing country, city or street");

      [address] = await db
        .insert(addressesTable)
        .values({ ...(newAddress as Address), shopId })
        .returning();
    }

    return address;
  } catch (e: any) {
    console.log("Error: ", e.cause);
    throw e;
  }
}
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
