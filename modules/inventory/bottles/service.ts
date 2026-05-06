import { and, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { db } from "../../../db/config";
import { bottlesLotsTable, bottlesTable } from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type {
  BottleCatg,
  BottlesQueryFilters,
  BottleType,
  CreateBottleBody,
  CreateBottleLot,
  ServiceIDs,
  UpdateBottleBody,
  UpdateBottleLotBody,
} from "./schema";
import type { DbTx } from "../../../utils/globalSchema";
import { AppError } from "../../../utils/AppError";

export async function createBottle(
  ids: ServiceIDs["base"],
  createBody: CreateBottleBody,
) {
  const { ownerId, shopId } = ids;
  await assertOwnership(shopId, ownerId);

  const result = await db.transaction(async (tx) => {
    const { bottleBody, lotBody } = createBody;
    const [bottle] = await tx
      .insert(bottlesTable)
      .values({
        ...bottleBody,
        shopId,
      })
      .returning();

    if (!bottle) throw new AppError(400, `Cannot create new inventory bottle.`);

    const [lot] = await tx
      .insert(bottlesLotsTable)
      .values({
        ...lotBody,
        costPrice: lotBody.costPrice.toFixed(3),
        baseSellPrice: lotBody.baseSellPrice.toFixed(3),
        receivedAt: new Date(lotBody.receivedAt),
        remainingStock: lotBody.stock || 0,
        bottleId: bottle.id,
      })
      .returning();

    if (!lot) throw new AppError(400, `Cannot create new inventory bottle.`);

    return { ...bottle, lots: [lot] };
  });

  return result;
}

export async function updateBottle(
  ids: ServiceIDs["extended"],
  updates: UpdateBottleBody,
) {
  const { ownerId, shopId, bottleId } = ids;
  await assertOwnership(shopId, ownerId);

  const [bottle] = await db
    .update(bottlesTable)
    .set(updates)
    .where(and(eq(bottlesTable.shopId, shopId), eq(bottlesTable.id, bottleId)))
    .returning();

  if (!bottle) throw new AppError(404, `Bottle with id: ${bottleId} not found`);

  return bottle;
}

export async function deleteBottle(ids: ServiceIDs["extended"]) {
  const { ownerId, shopId, bottleId } = ids;
  await assertOwnership(shopId, ownerId);

  const [bottle] = await db
    .delete(bottlesTable)
    .where(and(eq(bottlesTable.id, bottleId), eq(bottlesTable.shopId, shopId)))
    .returning();

  if (!bottle) throw new AppError(404, `Bottle with id: ${bottleId} not found`);

  return bottle;
}

export async function queryAll(
  ids: ServiceIDs["base"],
  filters: BottlesQueryFilters,
) {
  const { ownerId, shopId } = ids;

  const shop = await assertOwnership(shopId, ownerId);

  const conditions = prepareBottlesFilters(filters);
  const { page = 1, limit = 20 } = filters;

  const bottles = await db
    .select()
    .from(bottlesTable)
    .leftJoin(bottlesLotsTable, eq(bottlesLotsTable.bottleId, bottlesTable.id))
    .where(and(eq(bottlesTable.shopId, shopId), ...conditions))
    .offset((page - 1) * limit)
    .limit(limit)
    .orderBy(bottlesTable.createdAt);

  if (bottles.length === 0) return [];

  return bottles;
}

export async function queryById(ids: ServiceIDs["extended"]) {
  const { ownerId, shopId, bottleId } = ids;

  const shop = await assertOwnership(shopId, ownerId);

  const [bottle] = await db
    .select()
    .from(bottlesTable)
    .where(and(eq(bottlesTable.shopId, shopId), eq(bottlesTable.id, bottleId)));

  if (!bottle) throw new AppError(404, `Bottle with id: ${bottleId} not found`);

  return bottle;
}

export async function decreaseStock(
  quantities: { bottleId: number; qty: number }[],
  higherTx?: DbTx,
) {
  const _db = higherTx ?? db;
  await _db.transaction(async (tx) => {
    const decrementsTable = sql.join(
      quantities.map((obj) => sql`(${obj.bottleId}, ${Math.abs(obj.qty)})`),
      sql`, `,
    );

    const rows = await tx.execute(sql`
      SELECT 
        _deduct_bottles_lots(
          decs.id::integer,
          decs.qty::integer
        )
      FROM (VALUES ${decrementsTable}) AS decs(id, qty)
    `);
  });
}

// ----------- Lots -----------
export async function createBtlLot(
  ids: ServiceIDs["extended"],
  lotBody: CreateBottleLot,
) {
  const { ownerId, shopId, bottleId } = ids;

  await assertOwnership(shopId, ownerId);

  const [lot] = await db
    .insert(bottlesLotsTable)
    .values({
      ...lotBody,
      costPrice: lotBody.costPrice.toFixed(3),
      baseSellPrice: lotBody.baseSellPrice.toFixed(3),
      receivedAt: new Date(lotBody.receivedAt),
      remainingStock: lotBody.stock || 0,
      bottleId,
    })
    .returning();

  if (!lot)
    throw new AppError(
      400,
      `Failed to create new lot for bottle with id: ${bottleId}`,
    );

  return lot;
}

export async function updateBtlLot(
  ids: ServiceIDs["extendedLot"],
  updates: UpdateBottleLotBody,
) {
  const { ownerId, shopId, bottleId, lotId } = ids;

  await assertOwnership(shopId, ownerId);

  const { costPrice, baseSellPrice, stock, receivedAt, status } = updates;
  const [lot] = await db
    .update(bottlesLotsTable)
    .set({
      ...(costPrice && { costPrice: costPrice.toFixed(3) }),
      ...(baseSellPrice && { baseSellPrice: baseSellPrice.toFixed(3) }),
      ...(stock && {
        stock,
        remainingStock: sql`remaining_stock - (stock - ${stock})`,
      }),
      ...(receivedAt && { receivedAt: new Date(receivedAt) }),
      ...(status && { status }),
    })
    .where(
      and(
        eq(bottlesLotsTable.id, lotId),
        eq(bottlesLotsTable.bottleId, bottleId),
      ),
    )
    .returning();

  if (!lot)
    throw new AppError(
      404,
      `Failed to update, lot with id: ${lotId} may not exist or not belong to bottle with id: ${bottleId}`,
    );

  return lot;
}

export async function deleteBtlLot(ids: ServiceIDs["extendedLot"]) {
  const { ownerId, shopId, bottleId, lotId } = ids;

  await assertOwnership(shopId, ownerId);

  const [lot] = await db
    .delete(bottlesLotsTable)
    .where(
      and(
        eq(bottlesLotsTable.id, lotId),
        eq(bottlesLotsTable.bottleId, bottleId),
      ),
    )
    .returning();

  if (!lot)
    throw new AppError(
      404,
      `Lot with id: ${lotId} may not exist or not belonging to bottle with id: ${bottleId}`,
    );

  return lot;
}

// ----------- Helpers -----------
function prepareBottlesFilters(filters: BottlesQueryFilters) {
  const { catg, type, search, sku, minPrice, minStock, maxPrice, maxStock } =
    filters;

  const conditions = [];

  if (search) conditions.push(ilike(bottlesTable.name, `%${search}%`));
  if (type) conditions.push(eq(bottlesTable.type, type as BottleType));
  if (catg) conditions.push(eq(bottlesTable.category, catg as BottleCatg));
  if (sku) conditions.push(ilike(bottlesTable.sku, `%${sku}%`));
  if (minPrice)
    conditions.push(gte(bottlesLotsTable.baseSellPrice, minPrice.toFixed(2)));
  if (maxPrice)
    conditions.push(lte(bottlesLotsTable.baseSellPrice, maxPrice.toFixed(2)));
  if (minStock) conditions.push(gte(bottlesLotsTable.stock, minStock));
  if (maxStock) conditions.push(lte(bottlesLotsTable.stock, maxStock));

  return conditions;
}
