import {
  and,
  eq,
  gte,
  ilike,
  lte,
  max,
  sql,
  TransactionRollbackError,
} from "drizzle-orm";
import { db } from "../../../db/config";
import { bottlesTable } from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type {
  BottlesQueryFilters,
  CreateBottleBody,
  UpdateBottleBody,
} from "./schema";
import type { DbTx } from "../../../utils/globalSchema";
import { AppError } from "../../../utils/AppError";

export async function create(
  ownerId: number,
  shopId: number,
  bottle: CreateBottleBody,
) {
  await assertOwnership(shopId, ownerId);

  const [newBottle] = await db
    .insert(bottlesTable)
    .values({
      ...bottle,
      buyPrice: bottle.buyPrice.toFixed(2),
      sellPrice: bottle.sellPrice.toFixed(2),
      shopId,
    })
    .returning();

  if (!newBottle)
    throw new AppError(400, `Cannot create new bottle inventory.`);

  return newBottle;
}

export async function update(
  ownerId: number,
  shopId: number,
  bottleId: number,
  updates: UpdateBottleBody,
) {
  await assertOwnership(shopId, ownerId);

  const [bottle] = await db
    .update(bottlesTable)
    .set({
      ...(updates.name && { name: updates.name }),
      ...(updates.type && { type: updates.type }),
      ...(updates.category && { category: updates.category }),
      ...(updates.size && { size: updates.size }),
      ...(updates.buyPrice && { buyPrice: updates.buyPrice.toFixed(2) }),
      ...(updates.sellPrice && { sellPrice: updates.sellPrice.toFixed(2) }),
      ...(updates.img && { img: updates.img }),
    })
    .where(eq(bottlesTable.id, bottleId))
    .returning();

  if (!bottle) throw new AppError(404, `Bottle with id: ${bottleId} not found`);

  return bottle;
}

export async function remove(
  ownerId: number,
  shopId: number,
  bottleId: number,
) {
  await assertOwnership(shopId, ownerId);

  const [bottle] = await db
    .delete(bottlesTable)
    .where(and(eq(bottlesTable.id, bottleId), eq(bottlesTable.shopId, shopId)))
    .returning();

  if (!bottle) throw new AppError(404, `Bottle with id: ${bottleId} not found`);

  return bottle;
}

export async function queryAll(
  ownerId: number,
  shopId: number,
  filters: BottlesQueryFilters,
) {
  try {
    const shop = await assertOwnership(shopId, ownerId);

    const conditions = prepareBottlesFilters(filters);
    const { page = 1, limit = 20 } = filters;

    const bottles = await db
      .select()
      .from(bottlesTable)
      .where(and(eq(bottlesTable.shopId, shopId), ...conditions))
      .offset((page - 1) * limit)
      .limit(limit)
      .orderBy(bottlesTable.createdAt);

    if (bottles.length === 0) return [];

    return bottles.map((b) => ({
      ...b,
      shopName: shop.name,
      ...(shop.logo && { shopLogo: shop.logo }),
    }));
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function queryById(
  ownerId: number,
  shopId: number,
  bottleId: number,
) {
  try {
    const shop = await assertOwnership(shopId, ownerId);

    const [bottle] = await db
      .select()
      .from(bottlesTable)
      .where(
        and(eq(bottlesTable.shopId, shopId), eq(bottlesTable.id, bottleId)),
      );

    if (!bottle)
      throw new AppError(404, `Bottle with id: ${bottleId} not found`);

    return {
      ...bottle,
      shopName: shop.name,
      ...(shop.logo && { shopLogo: shop.logo }),
    };
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function increaseStock(
  bottleId: number,
  quantity: number,
  higherTx?: DbTx,
) {
  const _db = higherTx ?? db;
  const [bottle] = await _db
    .update(bottlesTable)
    .set({
      stock: sql`${bottlesTable.stock} + ${Math.abs(quantity)}`,
    })
    .where(eq(bottlesTable.id, bottleId))
    .returning();

  if (!bottle) throw new AppError(404, `Bottle with id: ${bottleId} not found`);

  return bottle;
}

export async function decreaseStock(
  quantities: { bottleId: number; qty: number }[],
  higherTx?: DbTx,
) {
  const _db = higherTx ?? db;
  const result = (await _db.transaction(async (tx) => {
    const decrementsTable = sql.join(
      quantities.map((obj) => sql`(${obj.bottleId}, ${Math.abs(obj.qty)})`),
      sql`, `,
    );

    const rows = await tx.execute(sql`
        UPDATE bottles AS b
        
        SET stock = stock - decs.qty,
          updated_at = NOW()
        
        FROM (VALUES ${decrementsTable} AS decs(b_id, qty))
        
        WHERE b.id = decs.b_id
          AND b.stock >= decs.qty
        
        RETURNING b.id AS id, b.stock AS stock 
      `);

    if (rows.length !== quantities.length) tx.rollback();

    return result;
  })) as { id: number; stock: number }[];

  return result;
}

// ----------- Helpers -----------
function prepareBottlesFilters(filters: BottlesQueryFilters) {
  const { catg, type, search, sku, minPrice, minStock, maxPrice, maxStock } =
    filters;

  const conditions = [];

  type Type = "spray" | "oil" | "tester";
  type Catg = "normal" | "elegant";

  if (search) conditions.push(ilike(bottlesTable.name, `%${search}%`));
  if (type) conditions.push(eq(bottlesTable.type, type as Type));
  if (catg) conditions.push(eq(bottlesTable.category, catg as Catg));
  if (sku) conditions.push(ilike(bottlesTable.sku, `%${sku}%`));
  if (minPrice)
    conditions.push(gte(bottlesTable.sellPrice, minPrice.toFixed(2)));
  if (maxPrice)
    conditions.push(lte(bottlesTable.sellPrice, maxPrice.toFixed(2)));
  if (minStock) conditions.push(gte(bottlesTable.stock, minStock));
  if (maxStock) conditions.push(lte(bottlesTable.stock, maxStock));

  return conditions;
}
