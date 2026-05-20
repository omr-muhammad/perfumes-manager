import { and, desc, eq, gte, ilike, lte, min, sql } from "drizzle-orm";
import { db } from "../../../db/config";
import {
  agingsTable,
  companiesTable,
  perfumeCompoundsTable,
  perfumesTable,
} from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type {
  CompoundLotSelect,
  CompoundsQueryFilters,
  CreateAgingBody,
  CreateCompBody,
  CreateCompoundLot,
  ServiceIDs,
  UpdateAgingBody,
  UpdateCompoundBody,
  UpdateCompoundLot,
} from "./schema";
import type { DbTx } from "../../../utils/globalSchema";
import { AppError } from "../../../utils/AppError";
import { compoundLotsTable } from "../../../db/schema/compoundLots";

export async function createComp(
  ids: ServiceIDs["base"],
  compData: CreateCompBody,
) {
  const { ownerId, shopId } = ids;
  await assertOwnership(shopId, ownerId);

  const { compound: newComp, lot, syncAlcohol } = compData;

  const result = await db.transaction(async (tx) => {
    const [compound] = await db
      .insert(perfumeCompoundsTable)
      .values({
        ...newComp,
        density: newComp.density?.toFixed(3) || "0.9",
        shopId,
      })
      .returning();

    if (!compound) tx.rollback();

    // The trigger will use `sync_alcohol` to run or skip
    await tx.execute(sql`SET LOCAL app.sync_alcohol = ${syncAlcohol}`);

    const [compoundLot] = await tx
      .insert(compoundLotsTable)
      .values({
        ...lot,
        densitySnapshot: compound!.density,
        compoundId: compound!.id,
        ...(lot.receivedAt
          ? { receivedAt: new Date(lot.receivedAt) }
          : { receivedAt: new Date() }),
        costPerKilo: lot.costPerKilo.toFixed(4),
        baseSellPerKilo: lot.baseSellPerKilo.toFixed(4),
        remainingOilAmount: lot.oilAmountGm,
        remainingSprayAmount: lot.sprayAmountMl,
      })
      .returning();

    if (!compoundLot) tx.rollback();

    return { ...compound, lot };
  });

  return result;
}

export async function updateComp(
  ids: ServiceIDs["extendsComp"],
  updates: UpdateCompoundBody,
) {
  const { ownerId, shopId, compId } = ids;
  await assertOwnership(shopId, ownerId);

  const { density, ...rest } = updates;
  const [compound] = await db
    .update(perfumeCompoundsTable)
    .set({
      ...rest,
      ...(density !== undefined ? { density: density.toFixed(3) } : {}),
    })
    .where(eq(perfumeCompoundsTable.id, compId))
    .returning();

  if (!compound)
    throw new AppError(404, `Perfume Compound with id: ${compId} not found`);

  return compound;
}

export async function removeComp(ids: ServiceIDs["extendsComp"]) {
  const { ownerId, shopId, compId } = ids;

  await assertOwnership(shopId, ownerId);

  const [compound] = await db
    .delete(perfumeCompoundsTable)
    .where(eq(perfumeCompoundsTable.id, compId))
    .returning();

  if (!compound)
    throw new AppError(404, `Perfume Compound with id: ${compId} not found`);

  return compound;
}

export async function queryAll(
  ids: ServiceIDs["base"],
  filters: CompoundsQueryFilters,
) {
  const { ownerId, shopId } = ids;

  await assertOwnership(shopId, ownerId);
  const conditions = prepareCompFilters(filters);
  const { page = 1, limit = 20 } = filters;

  const compounds = await db
    .select({
      id: perfumeCompoundsTable.id,
      perfumeName: min(perfumesTable.name),
      companyName: min(companiesTable.name),
      code: min(perfumeCompoundsTable.code),
      density: min(perfumeCompoundsTable.density),
      lots: sql<CompoundLotSelect[]>`
          json_agg(
            jsonb_build_object(
              'id', ${compoundLotsTable.id},
              'receivedAt', ${compoundLotsTable.receivedAt},
              'densitySnapshot', ${compoundLotsTable.densitySnapshot},
              'status', ${compoundLotsTable.status},
              'costPerKilo', ${compoundLotsTable.costPerKilo},
              'baseSellPerKilo', ${compoundLotsTable.baseSellPerKilo},
              'baseGmSell', ${compoundLotsTable.baseGmSell},
              'oilAmountGm', ${compoundLotsTable.oilAmountGm},
              'sprayAmountMl', ${compoundLotsTable.sprayAmountMl},
              'concentration', ${compoundLotsTable.concentration},
              'remainingOilAmount', ${compoundLotsTable.remainingOilAmount},
              'remainingSprayAmount', ${compoundLotsTable.remainingSprayAmount},
              'alcohol', alcohol_agg.data
            )
          )
        `,
    })
    .from(perfumeCompoundsTable)
    .innerJoin(
      perfumesTable,
      eq(perfumeCompoundsTable.perfumeId, perfumesTable.id),
    )
    .innerJoin(
      companiesTable,
      eq(perfumeCompoundsTable.companyId, companiesTable.id),
    )
    .leftJoin(
      compoundLotsTable,
      eq(perfumeCompoundsTable.id, compoundLotsTable.compoundId),
    )
    .leftJoin(
      sql`
          LATERAL (
            SELECT COALESCE(
              json_agg(
                jsonb_build_object(
                  'id': alco.id,
                  'name': alco.name,
                  'type': alco.type
               )
              ) AS data,
               '[]'::json
            )
            FROM alcohols AS alco
            JOIN compound_lots AS lot ON lot.alcohol_id = alco.id
            WHERE lot.compound_id = ${perfumeCompoundsTable.id}
              AND lot.alcohol_id IS NOT NULL
          ) AS alcohol_agg
        `,
      sql`true`,
    )
    .where(and(eq(perfumeCompoundsTable.shopId, shopId), ...conditions))
    .orderBy(desc(perfumeCompoundsTable.createdAt))
    .groupBy(perfumeCompoundsTable.id)
    .offset((page - 1) * limit)
    .limit(limit);

  if (compounds.length === 0) return [];

  return compounds;
}

export async function queryById(ids: ServiceIDs["extendsComp"]) {
  const { ownerId, shopId, compId } = ids;

  const shop = await assertOwnership(shopId, ownerId);

  const [compound] = await db
    .select()
    .from(perfumeCompoundsTable)
    .where(
      and(
        eq(perfumeCompoundsTable.shopId, shopId),
        eq(perfumeCompoundsTable.id, compId),
      ),
    );

  if (!compound)
    throw new AppError(404, `Perfume Compound with id: ${compId} not found`);

  const { updatedAt, ...comp } = compound;
  return {
    ...comp,
    shopName: shop.name,
    ...(shop.logo && { shopLogo: shop.logo }),
  };
}

// LOT
export async function createLot(
  ids: ServiceIDs["extendsComp"],
  compLot: CreateCompoundLot,
) {
  const { ownerId, shopId, compId } = ids;

  await assertOwnership(shopId, ownerId);
  const [comp] = await db
    .select({ density: perfumeCompoundsTable.density })
    .from(perfumeCompoundsTable)
    .where(
      and(
        eq(perfumeCompoundsTable.shopId, shopId),
        eq(perfumeCompoundsTable.id, compId),
      ),
    );

  if (!comp)
    throw new AppError(
      404,
      `Cannot create new lot, compound with id: ${compId} not found.`,
    );

  const [lot] = await db
    .insert(compoundLotsTable)
    .values({
      ...compLot,
      densitySnapshot: comp.density,
      compoundId: compId,
      ...(compLot.receivedAt
        ? { receivedAt: new Date(compLot.receivedAt) }
        : { receivedAt: new Date() }),
      costPerKilo: compLot.costPerKilo.toFixed(4),
      baseSellPerKilo: compLot.baseSellPerKilo.toFixed(4),
      remainingOilAmount: compLot.oilAmountGm,
      remainingSprayAmount: compLot.sprayAmountMl,
    })
    .returning();

  if (!lot)
    throw new AppError(
      404,
      `Cannot create new lot for compound with id: ${compId}`,
    );

  return lot;
}

export async function updateLot(
  ids: ServiceIDs["extendsCompLot"],
  updates: UpdateCompoundLot,
) {
  const { ownerId, shopId, compId, lotId } = ids;

  await assertOwnership(shopId, ownerId);

  const { receivedAt, costPerKilo, baseSellPerKilo, ...rest } = updates;

  const [lot] = await db
    .update(compoundLotsTable)
    .set({
      ...rest,
      ...(receivedAt && { receivedAt: new Date(receivedAt) }),
      ...(costPerKilo && { costPerKilo: costPerKilo.toFixed(3) }),
      ...(baseSellPerKilo && { baseSellPerKilo: baseSellPerKilo.toFixed(3) }),
    })
    .where(
      and(
        eq(compoundLotsTable.id, lotId),
        eq(compoundLotsTable.compoundId, compId),
      ),
    )
    .returning();

  if (!lot)
    throw new AppError(
      404,
      `Cannot update lot with id: ${lotId}, may not exist or not belong to this compound.`,
    );

  return lot;
}

export async function deleteLot(ids: ServiceIDs["extendsCompLot"]) {
  const { ownerId, shopId, compId, lotId } = ids;

  await assertOwnership(shopId, ownerId);

  const [lot] = await db
    .delete(compoundLotsTable)
    .where(
      and(
        eq(compoundLotsTable.id, lotId),
        eq(compoundLotsTable.compoundId, compId),
      ),
    )
    .returning();

  if (!lot)
    throw new AppError(
      404,
      `Cannot delete lot with id: ${lotId}, may not exist or not belonging to this compound.`,
    );

  return lot;
}

// AGING
export async function addAging(
  ids: ServiceIDs["extendsCompLot"],
  agingBody: CreateAgingBody,
) {
  const { ownerId, shopId, compId, lotId } = ids;

  await assertOwnership(shopId, ownerId);

  const { newAging, syncAlcohol } = agingBody;

  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.sync_alcohol = ${syncAlcohol}`);
    const [aging] = await tx
      .insert(agingsTable)
      .values({
        ...newAging,
        startDate:
          newAging.startDate === "now"
            ? new Date()
            : new Date(newAging.startDate),
        endDate: new Date(newAging.endDate),
        lotId,
      })
      .returning();

    if (!aging) tx.rollback();

    return aging;
  });

  return result!;
}

export async function updateAging(
  ids: ServiceIDs["extendsLotAging"],
  updatesBody: UpdateAgingBody,
) {
  const { ownerId, shopId, compId, lotId, agingId } = ids;

  await assertOwnership(shopId, ownerId);

  const { updates, syncAlcohol } = updatesBody;

  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.sync_alcohol = ${syncAlcohol}`);
    const [aging] = await db
      .update(agingsTable)
      .set({
        ...(updates.amount && { amount: updates.amount }),
        ...(updates.alcoholId && { alcoholId: updates.alcoholId }),
        ...(updates.startDate && {
          startDate:
            updates.startDate === "now"
              ? new Date()
              : new Date(updates.startDate),
        }),
        ...(updates.endDate && { endDate: new Date(updates.endDate) }),
      })
      .where(and(eq(agingsTable.lotId, lotId), eq(agingsTable.id, agingId)))
      .returning();

    if (!aging) tx.rollback();

    return aging;
  });

  return result!;
}

export async function deleteAging(
  ids: ServiceIDs["extendsLotAging"],
  syncAlcohol: boolean,
) {
  const { ownerId, shopId, compId, lotId, agingId } = ids;

  await assertOwnership(shopId, ownerId);

  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.sync_alcohol = ${syncAlcohol}`);
    const [aging] = await tx
      .delete(agingsTable)
      .where(and(eq(agingsTable.id, agingId), eq(agingsTable.lotId, lotId)))
      .returning();

    if (!aging) tx.rollback();

    return aging;
  });

  return result!;
}

export async function queryCompAgings(ids: ServiceIDs["extendsCompLot"]) {
  const { ownerId, shopId, compId, lotId } = ids;

  await assertOwnership(shopId, ownerId);

  const compAgings = await db
    .select()
    .from(agingsTable)
    .where(eq(agingsTable.lotId, lotId));

  return compAgings;
}

export async function queryCompAgingById(ids: ServiceIDs["extendsLotAging"]) {
  const { ownerId, shopId, compId, lotId, agingId } = ids;

  await assertOwnership(shopId, ownerId);

  const [compAging] = await db
    .select()
    .from(agingsTable)
    .where(and(eq(agingsTable.lotId, lotId), eq(agingsTable.id, agingId)));

  if (!compAging)
    throw new AppError(404, `Aging with id: ${agingId} not found`);

  return compAging;
}

export async function decreaseStock(
  amounts: { compId: number; spray?: number; oil?: number }[],
  higherTx?: DbTx,
) {
  const _db = higherTx ?? db;

  await _db.transaction(async (tx) => {
    const decrements = sql.join(
      amounts.map(
        (obj) =>
          sql`(${obj.compId}, ${Math.abs(obj.spray || 0)}, ${Math.abs(obj.oil || 0)})`,
      ),
      sql`, `,
    );

    await tx.execute(sql`
      SELECT _deduct_compound_lots(decs.lot_id, decs.oil, decs.spray)
      FROM (VALUES ${decrements}) AS decs(lot_id, spray, oil)
    `);
  });
}

// ------------ Helpers ------------
function prepareCompFilters(filters: CompoundsQueryFilters) {
  const {
    search,
    companyName,
    code,
    minOilAmount,
    maxOilAmount,
    minSprayAmount,
    maxSprayAmount,
    minKiloSellPrice,
    maxKiloSellPrice,
    minConcentration,
    maxConcentration,
    agingEndsBefore,
  } = filters;

  const conditions = [];

  if (search) conditions.push(ilike(perfumesTable.name, `%${search}%`));

  if (companyName)
    conditions.push(ilike(companiesTable.name, `%${companyName}%`));

  if (code) conditions.push(ilike(perfumeCompoundsTable.code, `%${code}%`));

  if (minOilAmount !== undefined)
    conditions.push(gte(compoundLotsTable.oilAmountGm, minOilAmount));

  if (maxOilAmount !== undefined)
    conditions.push(lte(compoundLotsTable.oilAmountGm, maxOilAmount));

  if (minSprayAmount !== undefined)
    conditions.push(gte(compoundLotsTable.sprayAmountMl, minSprayAmount));

  if (maxSprayAmount !== undefined)
    conditions.push(lte(compoundLotsTable.sprayAmountMl, maxSprayAmount));

  if (minKiloSellPrice !== undefined)
    conditions.push(
      gte(compoundLotsTable.baseSellPerKilo, minKiloSellPrice.toFixed(4)),
    );

  if (maxKiloSellPrice !== undefined)
    conditions.push(
      lte(compoundLotsTable.baseSellPerKilo, maxKiloSellPrice.toFixed(4)),
    );

  if (minConcentration !== undefined)
    conditions.push(gte(compoundLotsTable.concentration, minConcentration));

  if (maxConcentration !== undefined)
    conditions.push(lte(compoundLotsTable.concentration, maxConcentration));

  if (agingEndsBefore)
    conditions.push(lte(agingsTable.endDate, new Date(agingEndsBefore)));

  return conditions;
}
