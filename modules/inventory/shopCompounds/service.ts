import { and, eq, sql } from "drizzle-orm";
import { db } from "../../../db/config";
import {
  agingsTable,
  perfumeCompoundsTable,
  shopCompsTable,
} from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type {
  CreateAging,
  CreateShopComp,
  ShopCompLot,
  ServiceIDs,
  UpdateAging,
  UpdateStock,
  UpdateShopCompLot,
  UpdateShopComp,
} from "./schema";
import { AppError } from "../../../utils/AppError";
import { shopCompLotsTable } from "../../../db/schema/compoundLots";

export async function createShopComp(
  ids: ServiceIDs["base"],
  compData: CreateShopComp,
) {
  const { ownerId, shopId } = ids;
  await assertOwnership(shopId, ownerId);

  const { shopComp, lot } = compData;

  const result = await db.transaction(async (tx) => {
    const [pfCompound] = await tx
      .select()
      .from(perfumeCompoundsTable)
      .where(eq(perfumeCompoundsTable.id, shopComp.compoundId));

    if (!pfCompound)
      throw new AppError(
        404,
        `Perfume Compound with id: ${shopComp.compoundId} not found.`,
      );

    await tx.execute(`SET LOCAL app.should_sync = true;`);
    const [shopCompound] = await tx
      .insert(shopCompsTable)
      .values({
        ...shopComp,
        shopId,
      })
      .returning();

    // No AppError to get the actual error made creation failed
    if (!shopCompound) return tx.rollback();

    // NOTE: Trigger auto decrease alcohol amount if spray amount provided
    const [compoundLot] = await tx
      .insert(shopCompLotsTable)
      .values({
        ...lot,
        densitySnapshot: pfCompound.density,
        shopCompoundId: shopCompound.id,
        ...(lot.receivedAt
          ? { receivedAt: new Date(lot.receivedAt) }
          : { receivedAt: new Date() }),
        costPerKilo: lot.costPerKilo.toFixed(4),
        baseSellPerKilo: lot.baseSellPerKilo.toFixed(4),
        remainingOilAmount: lot.oilAmountGm,
        remainingSprayAmount: lot.sprayAmountMl,
      })
      .returning();

    if (!compoundLot) return tx.rollback();

    return { ...shopComp, lot };
  });

  return result;
}

export async function updateComp(
  ids: ServiceIDs["extendsComp"],
  updates: UpdateShopComp,
) {
  const { ownerId, shopId, shopCompId } = ids;
  await assertOwnership(shopId, ownerId);

  const [shopComp] = await db
    .update(shopCompsTable)
    .set(updates)
    .where(
      and(eq(shopCompsTable.id, shopCompId), eq(shopCompsTable.shopId, shopId)),
    )
    .returning();

  if (shopComp) return shopComp;

  const [found] = await db
    .select()
    .from(shopCompsTable)
    .where(eq(shopCompsTable.id, shopCompId));

  if (!found)
    throw new AppError(404, `Shop Compound with id: ${shopCompId} not found.`);

  throw new AppError(401, `Shop Compound does not belong to this shop.`);
}

export async function removeComp(ids: ServiceIDs["extendsComp"]) {
  const { ownerId, shopId, shopCompId } = ids;

  await assertOwnership(shopId, ownerId);

  const result = await db.transaction(async (tx) => {
    await tx.execute(`SET LOCAL app.should_sync = false;`);

    const [shopComp] = await tx
      .delete(shopCompsTable)
      .where(
        and(
          eq(shopCompsTable.id, shopCompId),
          eq(shopCompsTable.shopId, shopId),
        ),
      )
      .returning();

    if (shopComp) return shopComp;

    const [found] = await tx
      .select()
      .from(shopCompsTable)
      .where(eq(shopCompsTable.id, shopCompId));

    if (!found)
      throw new AppError(
        404,
        `Shop Compound with id: ${shopCompId} not found.`,
      );

    throw new AppError(401, `Shop Compound does not belong to this shop.`);
  });
}

export async function queryById(ids: ServiceIDs["extendsComp"]) {
  const { ownerId, shopId, shopCompId } = ids;

  const shop = await assertOwnership(shopId, ownerId);

  const [compound] = await db
    .select()
    .from(perfumeCompoundsTable)
    .where(
      and(eq(shopCompsTable.shopId, shopId), eq(shopCompsTable.id, shopCompId)),
    );

  if (!compound)
    throw new AppError(
      404,
      `Perfume Compound with id: ${shopCompId} not found`,
    );

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
  shopCompLot: ShopCompLot,
) {
  const { ownerId, shopId, shopCompId } = ids;

  await assertOwnership(shopId, ownerId);

  const [pfComp] = await db
    .select({ density: perfumeCompoundsTable.density })
    .from(perfumeCompoundsTable)
    .where(and(eq(perfumeCompoundsTable.id, shopCompId)));

  if (!pfComp)
    throw new AppError(
      404,
      `Cannot create new lot, compound with id: ${shopCompId} not found.`,
    );

  const compLot = await db.transaction(async (tx) => {
    const [lot] = await tx
      .insert(shopCompLotsTable)
      .values({
        ...shopCompLot,
        densitySnapshot: pfComp.density,
        shopCompoundId: shopCompId,
        ...(shopCompLot.receivedAt
          ? { receivedAt: new Date(shopCompLot.receivedAt) }
          : { receivedAt: new Date() }),
        costPerKilo: shopCompLot.costPerKilo.toFixed(4),
        baseSellPerKilo: shopCompLot.baseSellPerKilo.toFixed(4),
        remainingOilAmount: shopCompLot.oilAmountGm,
        remainingSprayAmount: shopCompLot.sprayAmountMl,
      })
      .returning();

    if (!lot)
      throw new AppError(
        404,
        `Cannot create new lot for shop compound with id: ${shopCompId}.`,
      );

    return lot;
  });

  return compLot;
}

export async function updateLot(
  ids: ServiceIDs["extendsCompLot"],
  updates: UpdateShopCompLot,
) {
  const { ownerId, shopId, shopCompId, lotId } = ids;

  await assertOwnership(shopId, ownerId);

  const { receivedAt, costPerKilo, baseSellPerKilo, ...rest } = updates;

  const [lot] = await db
    .update(shopCompLotsTable)
    .set({
      ...rest,
      ...(receivedAt && { receivedAt: new Date(receivedAt) }),
      ...(costPerKilo && { costPerKilo: costPerKilo.toFixed(3) }),
      ...(baseSellPerKilo && { baseSellPerKilo: baseSellPerKilo.toFixed(3) }),
    })
    .where(
      and(
        eq(shopCompLotsTable.id, lotId),
        eq(shopCompLotsTable.shopCompoundId, shopCompId),
      ),
    )
    .returning();

  if (lot) return lot;

  const [found] = await db
    .select()
    .from(shopCompLotsTable)
    .where(eq(shopCompLotsTable.id, lotId));

  if (!found)
    throw new AppError(
      404,
      `Update Failed: shop compound lot with id: ${lotId} not found.`,
    );

  throw new AppError(
    401,
    `Update Failed: shop compound lot with id: ${lotId} does not belong to this shop compound.`,
  );
}

export async function updateLotStock(
  ids: ServiceIDs["extendsCompLot"],
  newStock: UpdateStock,
) {
  const { ownerId, shopId, shopCompId, lotId } = ids;

  await assertOwnership(shopId, ownerId);

  const { newOilAmountGm, newSprayAmountMl, syncAlcohol } = newStock;

  const result = await db.transaction(async (tx) => {
    const shouldSync = typeof syncAlcohol === "boolean" ? syncAlcohol : false;
    await tx.execute(sql.raw(`SET LOCAL app.should_sync = ${shouldSync}`));

    const [lot] = await db
      .update(shopCompLotsTable)
      .set({
        ...(newOilAmountGm && {
          oilAmountGm: newOilAmountGm,
          remainingOilAmount: sql`remaining_oil_amount - (oil_amount_gm - ${newOilAmountGm})`,
        }),
        ...(newSprayAmountMl && {
          sprayAmountMl: newSprayAmountMl,
          remainingSprayAmount: sql`remaining_spray_amount - (spray_amount_ml - ${newSprayAmountMl})`,
        }),
      })
      .where(
        and(
          eq(shopCompLotsTable.shopCompoundId, shopCompId),
          eq(shopCompLotsTable.id, lotId),
          newSprayAmountMl
            ? sql`spray_amount_ml - ${newSprayAmountMl} <= remaining_spray_amount`
            : undefined,
          newOilAmountGm
            ? sql`oil_amount_gm - ${newOilAmountGm} <= remaining_oil_amount`
            : undefined,
        ),
      )
      .returning();

    if (lot) return lot;
    // Reasoning why update failed
    const [found] = await db
      .select()
      .from(shopCompLotsTable)
      .where(and(eq(shopCompLotsTable.id, lotId)));

    if (!found) throw new AppError(404, `Lot with id: ${lotId} not found.`);

    if (found.shopCompoundId !== shopCompId)
      throw new AppError(401, `Shop Compound does not belong to this shop.`);

    const takenSpray = found.sprayAmountMl! - found.remainingSprayAmount!;
    const takenOil = found.oilAmountGm! - found.remainingOilAmount!;

    const oilMsg =
      newOilAmountGm && newOilAmountGm < takenOil
        ? `Cannot set oil amount to ${newOilAmountGm}gm, while ${takenOil}gm was already taken.`
        : "";
    const sprayMsg =
      newSprayAmountMl && newSprayAmountMl < takenSpray
        ? `Cannot set spray amount to ${newSprayAmountMl}ml, while ${takenSpray}ml was already taken.`
        : "";

    throw new AppError(400, `${oilMsg}${oilMsg && " "}${sprayMsg}`);
  });

  return result;
}

export async function deleteLot(ids: ServiceIDs["extendsCompLot"]) {
  const { ownerId, shopId, shopCompId, lotId } = ids;

  await assertOwnership(shopId, ownerId);

  // COME_BACK
  /* 
    make decision about sync_alcohol variable should it come in body
    or even if there is a real situation will make a user delete a lot
    need to restore alcohol again
  */
  const [lot] = await db
    .delete(shopCompLotsTable)
    .where(
      and(
        eq(shopCompLotsTable.id, lotId),
        eq(shopCompLotsTable.shopCompoundId, shopCompId),
      ),
    )
    .returning();

  if (lot) return lot;

  const [found] = await db
    .select()
    .from(shopCompLotsTable)
    .where(eq(shopCompLotsTable.id, lotId));

  if (!found)
    throw new AppError(
      404,
      `Update Failed: shop compound lot with id: ${lotId} not found.`,
    );

  throw new AppError(
    401,
    `Update Failed: shop compound lot with id: ${lotId} does not belong to this shop compound.`,
  );
}

// AGING
export async function addAging(
  ids: ServiceIDs["extendsCompLot"],
  newAging: CreateAging,
) {
  const { ownerId, shopId, shopCompId, lotId } = ids;

  await assertOwnership(shopId, ownerId);

  // NOTE: Alcohol is auto synced by the trigger
  const [aging] = await db
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

  if (!aging)
    throw new AppError(
      400,
      "Failed to create aging for unknown, try again later.",
    );

  return aging;
}

export async function updateAging(
  ids: ServiceIDs["extendsLotAging"],
  updatesBody: UpdateAging,
) {
  const { ownerId, shopId, shopCompId, lotId, agingId } = ids;

  await assertOwnership(shopId, ownerId);

  const { updates, syncAlcohol } = updatesBody;

  const result = await db.transaction(async (tx) => {
    const shouldSync = typeof syncAlcohol === "boolean" ? syncAlcohol : "";
    await tx.execute(`SET LOCAL app.should_sync = ${shouldSync}`);

    const [aging] = await tx
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

    if (aging) return aging;

    const [found] = await tx
      .select()
      .from(agingsTable)
      .where(eq(agingsTable.id, agingId));

    if (!found)
      throw new AppError(
        404,
        `Update Failed: aging with id: ${agingId} not found.`,
      );

    throw new AppError(
      401,
      `Update Failed: aging with id: ${agingId} does not belong to this shop compound lot.`,
    );
  });

  return result;
}

export async function deleteAging(
  ids: ServiceIDs["extendsLotAging"],
  syncAlcohol: boolean,
) {
  const { ownerId, shopId, shopCompId, lotId, agingId } = ids;

  await assertOwnership(shopId, ownerId);

  const result = await db.transaction(async (tx) => {
    const shouldSync = typeof syncAlcohol === "boolean" ? syncAlcohol : "";
    await tx.execute(`SET LOCAL app.should_sync = ${shouldSync}`);

    const [aging] = await tx
      .delete(agingsTable)
      .where(and(eq(agingsTable.id, agingId), eq(agingsTable.lotId, lotId)))
      .returning();

    if (aging) return aging;

    const [found] = await tx
      .select()
      .from(agingsTable)
      .where(eq(agingsTable.id, agingId));

    if (!found)
      throw new AppError(
        404,
        `Update Failed: aging with id: ${agingId} not found.`,
      );

    throw new AppError(
      401,
      `Update Failed: aging with id: ${agingId} does not belong to this shop compound lot.`,
    );
  });

  return result;
}

export async function queryCompAgings(ids: ServiceIDs["extendsCompLot"]) {
  const { ownerId, shopId, shopCompId, lotId } = ids;

  await assertOwnership(shopId, ownerId);

  const compAgings = await db
    .select()
    .from(agingsTable)
    .where(eq(agingsTable.lotId, lotId));

  return compAgings;
}

export async function queryCompAgingById(ids: ServiceIDs["extendsLotAging"]) {
  const { ownerId, shopId, shopCompId, lotId, agingId } = ids;

  await assertOwnership(shopId, ownerId);

  const [aging] = await db
    .select()
    .from(agingsTable)
    .where(and(eq(agingsTable.lotId, lotId), eq(agingsTable.id, agingId)));

  if (aging) return aging;

  const [found] = await db
    .select()
    .from(agingsTable)
    .where(eq(agingsTable.id, agingId));

  if (!found)
    throw new AppError(
      404,
      `Update Failed: aging with id: ${agingId} not found.`,
    );

  throw new AppError(
    401,
    `Update Failed: aging with id: ${agingId} does not belong to this shop compound lot.`,
  );
}

// export async function decreaseStock(
//   amounts: { shopCompId: number; spray?: number; oil?: number }[],
//   higherTx?: DbTx,
// ) {
//   const _db = higherTx ?? db;

//   await _db.transaction(async (tx) => {
//     const decrements = sql.join(
//       amounts.map(
//         (obj) =>
//           sql`(${obj.shopCompId}, ${Math.abs(obj.spray || 0)}, ${Math.abs(obj.oil || 0)})`,
//       ),
//       sql`, `,
//     );

//     await tx.execute(sql`
//       SELECT _deduct_compound_lots(decs.lot_id, decs.oil, decs.spray)
//       FROM (VALUES ${decrements}) AS decs(lot_id, spray, oil)
//     `);
//   });
// }

// ------------ Helpers ------------
// function prepareCompFilters(filters: CompoundsQueryFilters) {
//   const {
//     search,
//     companyName,
//     code,
//     minOilAmount,
//     maxOilAmount,
//     minSprayAmount,
//     maxSprayAmount,
//     minKiloSellPrice,
//     maxKiloSellPrice,
//     minConcentration,
//     maxConcentration,
//     agingEndsBefore,
//   } = filters;

//   const conditions = [];

//   if (search) conditions.push(ilike(perfumesTable.name, `%${search}%`));

//   if (companyName)
//     conditions.push(ilike(companiesTable.name, `%${companyName}%`));

//   if (code) conditions.push(ilike(perfumeCompoundsTable.code, `%${code}%`));

//   if (minOilAmount !== undefined)
//     conditions.push(gte(shopCompLotsTable.oilAmountGm, minOilAmount));

//   if (maxOilAmount !== undefined)
//     conditions.push(lte(shopCompLotsTable.oilAmountGm, maxOilAmount));

//   if (minSprayAmount !== undefined)
//     conditions.push(gte(shopCompLotsTable.sprayAmountMl, minSprayAmount));

//   if (maxSprayAmount !== undefined)
//     conditions.push(lte(shopCompLotsTable.sprayAmountMl, maxSprayAmount));

//   if (minKiloSellPrice !== undefined)
//     conditions.push(
//       gte(shopCompLotsTable.baseSellPerKilo, minKiloSellPrice.toFixed(4)),
//     );

//   if (maxKiloSellPrice !== undefined)
//     conditions.push(
//       lte(shopCompLotsTable.baseSellPerKilo, maxKiloSellPrice.toFixed(4)),
//     );

//   if (minConcentration !== undefined)
//     conditions.push(gte(shopCompLotsTable.concentration, minConcentration));

//   if (maxConcentration !== undefined)
//     conditions.push(lte(shopCompLotsTable.concentration, maxConcentration));

//   if (agingEndsBefore)
//     conditions.push(lte(agingsTable.endDate, new Date(agingEndsBefore)));

//   return conditions;
// }
