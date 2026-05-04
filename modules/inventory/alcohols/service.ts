import { and, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { db } from "../../../db/config";
import {
  alcoholLotsTable,
  alcoholsTable,
  shopsTable,
} from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type {
  AlcoholLot,
  AlcoholQueryFilters,
  CreateAlcoBody,
  UpdateAlcoBody,
  UpdateLotBody,
} from "./schema";
import type { DbTx } from "../../../utils/globalSchema";
import { AppError } from "../../../utils/AppError";

export async function createAlco(
  ownerId: number,
  shopId: number,
  newAlco: CreateAlcoBody,
) {
  const shop = await assertOwnership(shopId, ownerId);

  const { alcohol, alcoholLot } = newAlco;
  const result = db.transaction(async (tx) => {
    const [alco] = await tx
      .insert(alcoholsTable)
      .values({
        ...alcohol,
        shopId,
      })
      .returning();

    if (!alco)
      throw new AppError(
        400,
        `Cannot create new alcohol for shop: ${shop.name}`,
      );

    const [alcoLot] = await tx
      .insert(alcoholLotsTable)
      .values({
        ...alcoholLot,
        costPerLiter: alcoholLot.costPerLiter.toFixed(3),
        baseSellPerLiter: alcoholLot.baseSellPerLiter.toFixed(3),
        receivedAt: new Date(alcoholLot.receivedAt),
        expiryDate: new Date(alcoholLot.expiryDate),
        alcoholId: alco.id,
        remainingAmount: alcoholLot.amount || 0,
      })
      .returning();

    if (!alcoLot)
      throw new AppError(
        400,
        `Cannot create new alcohol for shop ${shop.name}`,
      );

    return { ...alco, lot: alcoLot };
  });

  return result;
}

export async function updateAlco(
  ownerId: number,
  shopId: number,
  alcoholId: number,
  updates: UpdateAlcoBody,
) {
  await assertOwnership(shopId, ownerId);

  const [alcohol] = await db
    .update(alcoholsTable)
    .set(updates)
    .where(eq(alcoholsTable.id, alcoholId))
    .returning();

  if (!alcohol)
    throw new AppError(404, `Alcohol with id: ${alcoholId} not found.`);

  return alcohol;
}

export async function deleteAlco(
  ownerId: number,
  shopId: number,
  alcoholId: number,
) {
  await assertOwnership(shopId, ownerId);

  const [alcohol] = await db
    .delete(alcoholsTable)
    .where(eq(alcoholsTable.id, alcoholId))
    .returning();

  if (!alcohol)
    throw new AppError(404, `Alcohol with id: ${alcoholId} not found.`);

  return alcohol;
}

export async function queryAll(
  ownerId: number,
  shopId: number,
  filters: AlcoholQueryFilters,
) {
  await assertOwnership(shopId, ownerId);

  const conditions = prepareAlcoFilters(filters);
  const { page = 1, limit = 20 } = filters;

  const alcohols = await db
    .select()
    .from(alcoholsTable)
    .innerJoin(
      alcoholLotsTable,
      eq(alcoholLotsTable.alcoholId, alcoholsTable.id),
    )
    .where(and(eq(alcoholsTable.shopId, shopId), ...conditions))
    .offset((page - 1) * limit)
    .limit(limit);

  return alcohols;
}

export async function queryById(
  ownerId: number,
  shopId: number,
  alcoholId: number,
) {
  await assertOwnership(shopId, ownerId);

  const [alcohol] = await db
    .select()
    .from(alcoholsTable)
    .where(eq(alcoholsTable.id, alcoholId));

  if (!alcohol)
    throw new AppError(404, `Alcohol with id: ${alcoholId} not found.`);

  return alcohol;
}

export async function increaseStock(
  lotId: number,
  amount: number,
  higherTx?: DbTx,
) {
  const _db = higherTx ?? db;
  const [alcohol] = await _db
    .update(alcoholLotsTable)
    .set({
      amount: sql`${alcoholLotsTable.amount} + ${Math.abs(amount)}`,
    })
    .where(eq(alcoholLotsTable.id, lotId))
    .returning();

  if (!alcohol)
    throw new AppError(
      404,
      `There no alcohol lot with id: ${lotId} not found.`,
    );

  return alcohol;
}

export async function decreaseStock(
  amounts: { alcoholId: number; amountInMl: number }[],
  higherTx?: DbTx,
) {
  const _db = higherTx ?? db;
  await _db.transaction(async (tx) => {
    const decrementsTable = sql.join(
      amounts.map(
        (obj) => sql`(${obj.alcoholId}, ${Math.abs(obj.amountInMl)})`,
      ),
      sql`, `,
    );

    const rows = await tx.execute(sql`
        SELECT 
          _deduct_alcohol_lots(
            decs.alco_id::integer,
            decs.amount::integer
          ) 
        FROM (VALUES ${decrementsTable} AS decs(alco_id, amount))
      `);
  });
}

// ---------- Lots ----------
export async function createLot(
  ownerId: number,
  shopId: number,
  alcoholId: number,
  newLot: AlcoholLot,
) {
  await assertOwnership(shopId, ownerId);

  const [lot] = await db
    .insert(alcoholLotsTable)
    .values({
      ...newLot,
      alcoholId,
      costPerLiter: newLot.costPerLiter.toFixed(3),
      baseSellPerLiter: newLot.baseSellPerLiter.toFixed(3),
      receivedAt: new Date(newLot.receivedAt),
      expiryDate: new Date(newLot.expiryDate),
      remainingAmount: newLot.amount || 0,
    })
    .returning();

  if (!lot)
    throw new AppError(
      400,
      `Cannot create new lot for alcohol with id: ${alcoholId}`,
    );

  return lot;
}

export async function updateLot(
  ownerId: number,
  shopId: number,
  lotId: number,
  updates: UpdateLotBody,
) {
  await assertOwnership(shopId, ownerId);

  const { baseSellPerLiter, costPerLiter, expiryDate, receivedAt, amount } =
    updates;
  const [lot] = await db
    .update(alcoholLotsTable)
    .set({
      ...(baseSellPerLiter && {
        baseSellPerLiter: baseSellPerLiter.toFixed(3),
      }),
      ...(costPerLiter && { costPerLiter: costPerLiter.toFixed(3) }),
      ...(expiryDate && { expiryDate: new Date(expiryDate) }),
      ...(receivedAt && { receivedAt: new Date(receivedAt) }),
      ...(Number.isFinite(amount) && {
        amount,
        remainingAmount:
          amount === 0 ? 0 : sql`remaining_amount - (amount - ${amount})`,
      }),
    })
    .where(eq(alcoholLotsTable.id, lotId))
    .returning();

  if (!lot) throw new AppError(404, `lot with id ${lotId} not found.`);

  return lot;
}

export async function deleteLot(
  ownerId: number,
  shopId: number,
  lotId: number,
) {
  await assertOwnership(shopId, ownerId);

  const [lot] = await db
    .delete(alcoholLotsTable)
    .where(eq(alcoholLotsTable.id, lotId))
    .returning();

  if (!lot) throw new AppError(404, `lot with id ${lotId} not found.`);

  return lot;
}

// ---------- Helpers ----------
function prepareAlcoFilters(filters: AlcoholQueryFilters) {
  const {
    search,
    type,
    minAmount,
    maxAmount,
    minLtPrice,
    maxLtPrice,
    minConcentration,
    maxConcentration,
    expiresBefore,
    expiresAfter,
  } = filters;

  const conditions = [];
  let minInMl, maxInMl;

  if (search) conditions.push(ilike(alcoholsTable.name, `%${search}%`));
  if (type) conditions.push(ilike(alcoholsTable.type, `%${type}%`));
  if (minInMl) conditions.push(gte(alcoholLotsTable.remainingAmount, minInMl));
  if (maxInMl) conditions.push(lte(alcoholLotsTable.remainingAmount, maxInMl));
  if (minLtPrice)
    conditions.push(
      gte(alcoholLotsTable.baseSellPerLiter, minLtPrice.toFixed(2)),
    );
  if (maxLtPrice)
    conditions.push(
      lte(alcoholLotsTable.baseSellPerLiter, maxLtPrice.toFixed(2)),
    );
  if (minConcentration)
    conditions.push(gte(alcoholsTable.concentration, minConcentration));
  if (maxConcentration)
    conditions.push(lte(alcoholsTable.concentration, maxConcentration));
  if (expiresBefore)
    conditions.push(lte(alcoholLotsTable.expiryDate, new Date(expiresBefore)));
  if (expiresAfter)
    conditions.push(gte(alcoholLotsTable.expiryDate, new Date(expiresAfter)));

  return conditions;
}
