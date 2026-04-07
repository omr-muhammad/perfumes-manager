import { and, eq } from "drizzle-orm";
import { db } from "../../db/config";
import { addressesTable, shopsTable, usersTable } from "../../db/schema";
import type {
  Address,
  CreateShopBody,
  NewShop,
  StaffBody,
  UpdateAddressBody,
  UpdateShopBody,
} from "./schema";
import { shopsStaffTable } from "../../db/schema/index";

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

export async function remove(shopId: number, ownerId: number) {
  try {
    await assertOwnership(shopId, ownerId);

    const [shop] = await db
      .delete(shopsTable)
      .where(and(eq(shopsTable.id, shopId), eq(shopsTable.ownerId, ownerId)))
      .returning();

    return shop;
  } catch (e: any) {
    console.log("Error: ", e.cause);
    throw e;
  }
}

export async function query(ownerId?: number) {
  try {
    if (!ownerId) return await db.select().from(shopsTable);

    await assertIsOwner(ownerId);

    const shops = await db
      .select()
      .from(shopsTable)
      .where(eq(shopsTable.ownerId, ownerId));

    return shops;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function queryById(shopId: number, ownerId?: number) {
  try {
    if (!ownerId)
      return await db
        .select()
        .from(shopsTable)
        .where(eq(shopsTable.id, shopId));

    await assertOwnership(shopId, ownerId);

    const [shop] = await db
      .select()
      .from(shopsTable)
      .innerJoin(addressesTable, eq(addressesTable.shopId, shopsTable.id))
      .where(and(eq(shopsTable.id, shopId), eq(shopsTable.ownerId, ownerId)));

    if (!shop) return null;

    const {
      shops,
      addresses: { shopId: adShopId, createdAt, updatedAt, ...others },
    } = shop;
    return { ...shops, ...others };
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function addStaff(
  ownerId: number,
  shopId: number,
  staff: StaffBody,
) {
  try {
    const shop = await assertOwnership(shopId, ownerId);

    const [user] = await db
      .update(usersTable)
      .set({ role: "staff" })
      .where(eq(usersTable.email, staff.email))
      .returning();

    if (!user) throw new Error(`User with email: ${staff.email} not found`);

    const [shopStaff] = await db
      .insert(shopsStaffTable)
      .values({
        shopId,
        userId: user.id,
        role: staff.role,
      })
      .returning();

    if (!shopStaff) throw new Error("Cannot create shop staff.");

    return {
      shop,
      user,
      staffRole: shopStaff.role,
    };
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function removeStaff(
  ownerId: number,
  shopId: number,
  staffId: number,
) {
  try {
    const shop = await assertOwnership(shopId, ownerId);

    const [user] = await db
      .update(usersTable)
      .set({ role: "customer" })
      .where(eq(usersTable.id, staffId))
      .returning();

    if (!user) throw new Error(`User with id: ${staffId} not found`);

    const [shopStaff] = await db
      .delete(shopsStaffTable)
      .where(
        and(
          eq(shopsStaffTable.userId, staffId),
          eq(shopsStaffTable.shopId, shopId),
        ),
      )
      .returning();

    return shopStaff;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
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
