import { and, eq, ne } from "drizzle-orm";
import { db } from "../../db/config";
import { addressesTable, shopsTable, usersTable } from "../../db/schema";
import type {
  NewShop,
  StaffBody,
  UpdateShopBody,
  UpdateStaffBody,
} from "./schema";
import { shopsStaffTable } from "../../db/schema/index";
import { assertOwnership, assertIsOwner } from "../../utils/assertOwnership";
import type { Address, UpdateAddressBody } from "../../utils/globalSchema";

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
        ),
      );

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
      .set(updates)
      .where(
        and(
          eq(shopsStaffTable.shopId, shopId),
          eq(shopsStaffTable.userId, staffId),
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
