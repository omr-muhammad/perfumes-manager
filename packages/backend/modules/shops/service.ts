import { and, eq, ilike, ne, sql } from "drizzle-orm";
import { db } from "../../db/config";
import {
  addressesTable,
  ordersTable,
  shopsTable,
  usersTable,
} from "../../db/schema";
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
    .values({ ...address, shopId })
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
  const conditions = prepareShopsQuery(filters);
  const { page = 1, limit = 20 } = filters;

  if (ownerId) {
    await assertIsOwner(ownerId);
    conditions.push(
      eq(shopsTable.ownerId, ownerId),
      eq(usersTable.active, true),
    );
  }

  const pendingOrders = sql<number>`
      SELECT COUNT(*)::INT
      FROM ${ordersTable}
      WHERE 
        ${ordersTable.shopId} = ${shopsTable.id}
        AND ${ordersTable.orderStatus} = 'pending'
    `;

  const result = await db
    .select({
      id: shopsTable.id,
      name: shopsTable.name,
      logo: shopsTable.logo,
      active: shopsTable.active,
      hidden: shopsTable.hidden,
      pendingOrders,
      address: {
        country: addressesTable.country,
        city: addressesTable.city,
        district: addressesTable.district,
      },
      totalCount: sql<number>`count(*) over()`.as("total_count"),
    })
    .from(shopsTable)
    .leftJoin(addressesTable, eq(addressesTable.shopId, shopsTable.id))
    .where(and(...conditions))
    .offset((page - 1) * limit)
    .limit(limit);

  const total = result[0]?.totalCount ?? 0;
  const shops = result.map(({ totalCount, ...shop }) => shop);

  return {
    shops,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  };
}

export async function queryById(shopId: number, ownerId?: number) {
  if (ownerId) return await assertOwnership(shopId, ownerId);

  const [shop] = await db
    .select()
    .from(shopsTable)
    .leftJoin(addressesTable, eq(addressesTable.shopId, shopsTable.id))
    .where(eq(shopsTable.id, shopId));

  if (!shop) throw new AppError(404, `Shop with id: ${shopId} not found.`);

  const { shops, addresses } = shop;

  return { ...shops, address: addresses };
}

export async function queryDistinctCities(ownerId?: number) {
  const cities = await db
    .selectDistinct({ city: addressesTable.city })
    .from(shopsTable)
    .innerJoin(addressesTable, eq(shopsTable.id, addressesTable.shopId))
    .where(ownerId ? eq(shopsTable.ownerId, ownerId) : undefined);

  return cities.map((row) => row.city);
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

    console.debug("Created Staff: ", userStaff);

    if (!userStaff) return tx.rollback();

    const [shopStaff] = await tx
      .insert(shopsStaffTable)
      .values({
        shopId,
        userId: userStaff.id,
        role: staffBody.role,
      })
      .returning();

    if (!shopStaff) return tx.rollback();

    return { userStaff, shopStaff };
  });

  return {
    shop,
    user: userStaff,
    shopStaff,
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
