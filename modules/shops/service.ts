import { and, eq, ilike, ne } from "drizzle-orm";
import { db } from "../../db/config";
import { addressesTable, shopsTable, usersTable } from "../../db/schema";
import type {
  NewShop,
  ShopsQueryFilters,
  StaffBody,
  UpdateShopBody,
  UpdateStaffBody,
} from "./schema";
import { shopsStaffTable } from "../../db/schema/index";
import { assertOwnership, assertIsOwner } from "../../utils/assertOwnership";
import type { Address } from "../../utils/globalSchema";

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

    if (!shop) return null;
    if (!address) return shop;

    const [shopAddress] = await db
      .insert(addressesTable)
      .values({
        ...address,
        shopId: shop.id,
      })
      .returning();

    return { ...shop, address: shopAddress };
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
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(shopsTable.id, shopId), eq(shopsTable.ownerId, ownerId)))
      .returning();

    return shop;
  } catch (e: any) {
    console.log("Error: ", e.cause);
    throw e;
  }
}

export async function upsertShopAddress(
  ownerId: number,
  shopId: number,
  address: Address,
) {
  try {
    await assertOwnership(shopId, ownerId);

    let [shopAddress] = await db
      .insert(addressesTable)
      .values(address)
      .onConflictDoUpdate({
        target: addressesTable.shopId,
        set: {
          ...address,
          updatedAt: new Date(),
        },
      })
      .returning();

    return shopAddress;
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

export async function handleActivation(shopId: number, active: boolean) {
  try {
    const [shop] = await db
      .update(shopsTable)
      .set({
        active,
        updatedAt: new Date(),
      })
      .where(eq(shopsTable.id, shopId))
      .returning();

    return shop;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function hide(ownerId: number, shopId: number, hidden: boolean) {
  try {
    await assertOwnership(shopId, ownerId);

    const [shop] = await db
      .update(shopsTable)
      .set({
        hidden,
        updatedAt: new Date(),
      })
      .where(and(eq(shopsTable.id, shopId), ne(shopsTable.hidden, hidden)))
      .returning();

    return shop;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

// -------------- Shop Staff --------------
export async function addStaff(
  ownerId: number,
  shopId: number,
  staffBody: StaffBody,
) {
  try {
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

    return user;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
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
  try {
    await assertOwnership(shopId, ownerId);

    const [staff] = await db
      .update(shopsStaffTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(shopsStaffTable.shopId, shopId),
          eq(shopsStaffTable.userId, staffId),
          ne(shopsStaffTable.role, updates.role),
        ),
      )
      .returning();

    return staff;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
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
