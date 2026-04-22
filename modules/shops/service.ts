import { and, eq, ilike, ne } from "drizzle-orm";
import { db } from "../../db/config";
import { addressesTable, shopsTable, usersTable } from "../../db/schema";
import type {
  CreateShop,
  ShopsQueryFilters,
  StaffBody,
  UpdateShopBody,
  UpdateStaffBody,
} from "./schema";
import { shopsStaffTable } from "../../db/schema/index";
import { assertOwnership, assertIsOwner } from "../../utils/assertOwnership";
import type { Address } from "../../utils/globalSchema";
import { AppError } from "../../utils/AppError";

export async function create(
  ownerId: number,
  newShop: CreateShop,
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

  if (!shop) throw new AppError(400, "Cannot create new shop.");
  if (!address) return shop;

  const [shopAddress] = await db
    .insert(addressesTable)
    .values({
      ...address,
      shopId: shop.id,
    })
    .returning();

  if (!shop) throw new AppError(400, "Cannot create new shop.");

  return { ...shop, address: shopAddress };
}

export async function update(
  shopId: number,
  ownerId: number,
  updates: UpdateShopBody,
) {
  await assertOwnership(shopId, ownerId);

  const [shop] = await db
    .update(shopsTable)
    .set(updates)
    .where(and(eq(shopsTable.id, shopId), eq(shopsTable.ownerId, ownerId)))
    .returning();

  if (!shop) throw new AppError(404, `Shop with id: ${shopId} not found.`);

  return shop;
}

export async function upsertShopAddress(
  ownerId: number,
  shopId: number,
  address: Address,
) {
  await assertOwnership(shopId, ownerId);

  const [shopAddress] = await db
    .insert(addressesTable)
    .values(address)
    .onConflictDoUpdate({
      target: addressesTable.shopId,
      set: {
        ...address,
      },
    })
    .returning();

  if (!shopAddress)
    throw new AppError(400, "Cannot creat/update shop address.");

  return shopAddress;
}

export async function remove(shopId: number, ownerId?: number) {
  if (ownerId) await assertOwnership(shopId, ownerId);

  const [shop] = await db
    .delete(shopsTable)
    .where(eq(shopsTable.id, shopId))
    .returning();

  if (!shop) throw new AppError(404, `Shop with id: ${shopId} not found.`);

  return shop;
}

export async function query(filters: ShopsQueryFilters, ownerId?: number) {
  try {
    const conditions = prepareShopsQuery(filters);
    const { page = 1, limit = 20 } = filters;

    if (!ownerId)
      return await db
        .select()
        .from(shopsTable)
        .leftJoin(addressesTable, eq(addressesTable.shopId, shopsTable.id))
        .where(and(...conditions))
        .offset((page - 1) * limit)
        .limit(limit);

    await assertIsOwner(ownerId);

    const result = await db
      .select()
      .from(shopsTable)
      .leftJoin(usersTable, eq(usersTable.id, ownerId))
      .leftJoin(addressesTable, eq(addressesTable.shopId, shopsTable.id))
      .where(
        and(
          eq(shopsTable.ownerId, ownerId),
          eq(shopsTable.active, true),
          eq(usersTable.active, true),
          ...conditions,
        ),
      )
      .offset((page - 1) * limit)
      .limit(limit);

    return result.map((item) => ({ ...item.shops, address: item.addresses }));
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function queryById(shopId: number, ownerId?: number) {
  if (ownerId) await assertOwnership(shopId, ownerId);

  const cond = ownerId ? eq(shopsTable.ownerId, ownerId) : undefined;
  const [shop] = await db
    .select()
    .from(shopsTable)
    .innerJoin(addressesTable, eq(addressesTable.shopId, shopsTable.id))
    .where(and(eq(shopsTable.id, shopId), cond));

  if (!shop) throw new AppError(404, `Shop with id: ${shopId} not found.`);

  const {
    shops,
    addresses: { shopId: adShopId, createdAt, updatedAt, ...others },
  } = shop;
  return { ...shops, ...others };
}

export async function handleActivation(shopId: number, active: boolean) {
  const [shop] = await db
    .update(shopsTable)
    .set({
      active,
    })
    .where(eq(shopsTable.id, shopId))
    .returning();

  if (!shop) throw new AppError(404, `Shop with id: ${shopId} not found.`);

  return shop;
}

export async function hide(ownerId: number, shopId: number, hidden: boolean) {
  await assertOwnership(shopId, ownerId);

  const [shop] = await db
    .update(shopsTable)
    .set({
      hidden,
    })
    .where(and(eq(shopsTable.id, shopId), ne(shopsTable.hidden, hidden)))
    .returning();

  if (!shop) throw new AppError(404, `Shop with id: ${shopId} not found.`);

  return shop;
}

// -------------- Shop Staff --------------
export async function addStaff(
  ownerId: number,
  shopId: number,
  staffBody: StaffBody,
) {
  const shop = await assertOwnership(shopId, ownerId);

  const { userStaff, shopStaff } = await db.transaction(async (tx) => {
    const hashed = await Bun.password.hash(staffBody.password);

    const [userStaff] = await tx
      .insert(usersTable)
      .values({
        ...staffBody,
        role: "staff",
        password: hashed,
      })
      .returning();

    if (!userStaff) tx.rollback();

    const [shopStaff] = await db
      .insert(shopsStaffTable)
      .values({
        shopId,
        userId: userStaff!.id,
        role: staffBody.role,
      })
      .returning();

    if (!shopStaff) tx.rollback();

    return { userStaff, shopStaff };
  });

  return {
    shop,
    user: userStaff!,
    staffRole: shopStaff!.role,
  };
}

export async function removeStaff(
  ownerId: number,
  shopId: number,
  staffId: number,
) {
  await assertOwnership(shopId, ownerId);
  const user = await db.transaction(async (tx) => {
    const [user] = await tx
      .update(usersTable)
      .set({ role: "customer" })
      .where(eq(usersTable.id, staffId))
      .returning();

    if (!user) tx.rollback();

    await tx
      .delete(shopsStaffTable)
      .where(
        and(
          eq(shopsStaffTable.shopId, shopId),
          eq(shopsStaffTable.userId, staffId),
        ),
      );

    return user;
  });

  return user!;
}

export async function getShopStaff(ownerId: number, shopId: number) {
  try {
    await assertOwnership(shopId, ownerId);

    const staff = await db
      .select()
      .from(shopsStaffTable)
      .innerJoin(usersTable, eq(usersTable.id, shopsStaffTable.userId))
      .where(eq(shopsStaffTable.shopId, shopId));

    return staff;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function updateShopStaff(
  ownerId: number,
  shopId: number,
  staffId: number,
  updates: UpdateStaffBody,
) {
  await assertOwnership(shopId, ownerId);

  const [staff] = await db
    .update(shopsStaffTable)
    .set(updates)
    .where(
      and(
        eq(shopsStaffTable.shopId, shopId),
        eq(shopsStaffTable.userId, staffId),
        ne(shopsStaffTable.role, updates.role),
      ),
    )
    .returning();

  if (!staff)
    throw new AppError(
      404,
      `Staff with id: ${staffId} not found, or may not belong to shop with id: ${shopId}`,
    );

  return staff;
}

// -------------- Helpers --------------
function prepareShopsQuery(filters: ShopsQueryFilters) {
  const { search, country, city, district } = filters;

  const conditions = [];

  if (search) conditions.push(ilike(shopsTable.name, `%${search}%`));
  if (country) conditions.push(ilike(addressesTable.country, `%${country}%`));
  if (city) conditions.push(ilike(addressesTable.city, `%${city}%`));
  if (district)
    conditions.push(ilike(addressesTable.district, `%${district}%`));

  return conditions;
}
