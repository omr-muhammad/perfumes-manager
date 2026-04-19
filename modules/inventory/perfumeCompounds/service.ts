import { and, eq, gte, ilike, lte, max, sql } from "drizzle-orm";
import { db } from "../../../db/config";
import {
  agingTable,
  companiesTable,
  perfumesCompoundsTable,
  perfumesTable,
} from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type {
  CompoundsQueryFilters,
  CreateAging,
  CreateAgingBody,
  CreateCompBody,
  UpdateAgingBody,
  UpdateCompoundBody,
} from "./schema";
import * as alcoholService from "../alcohols/service";
import type { DbTx } from "../../../utils/globalSchema";

export async function create(
  ownerId: number,
  shopId: number,
  compData: CreateCompBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const { compound: newComp, aging: newAging, useAlcohol } = compData;
    const mlPrice = newComp.kiloSellPrice / 1000;

    const result = await db.transaction(async (tx) => {
      const [compound] = await tx
        .insert(perfumesCompoundsTable)
        .values({
          ...newComp,
          kiloBuyPrice: newComp.kiloBuyPrice.toFixed(4),
          kiloSellPrice: newComp.kiloSellPrice.toFixed(4),
          mlPrice: mlPrice.toFixed(4),
          shopId,
        })
        .returning();

      if (!compound) tx.rollback();

      if (useAlcohol && compound!.sprayAmountInMl! > 0) {
        const oilAmount =
          compound!.sprayAmountInMl * (compound!.concentration! / 100);
        const alcoAmount = compound!.sprayAmountInMl - oilAmount;

        const [alcohol] = await alcoholService.decreaseStock(
          [{ alcoholId: compound!.alcoholId!, amountInMl: alcoAmount }],
          tx,
        );

        if (!alcohol) tx.rollback();
      }

      if (!newAging) return { compound: compound!, aging: undefined };

      const [aging] = await db
        .insert(agingTable)
        .values({
          ...newAging,
          startDate:
            newAging.startDate === "now"
              ? new Date()
              : new Date(newAging.startDate),
          endDate: new Date(newAging.endDate),
          compoundId: compound!.id,
        })
        .returning();

      return { compound: compound!, aging };
    });

    return { ...result.compound, aging: result.aging };
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function update(
  ownerId: number,
  shopId: number,
  compId: number,
  updates: UpdateCompoundBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const {
      code,
      kiloSellPrice,
      kiloBuyPrice,
      oilAmountInMl,
      sprayAmountInMl,
      companyId,
      companyName,
      perfumeId,
      perfumeName,
      concentration,
    } = updates;
    const isNum = (val: any) => Number.isFinite(val);

    console.log("oil amount", oilAmountInMl);

    const [compound] = await db
      .update(perfumesCompoundsTable)
      .set({
        ...(perfumeId && { perfumeId }),
        ...(perfumeName && { perfumeName }),
        ...(companyId && { companyId }),
        ...(companyName && { companyName }),
        ...(isNum(oilAmountInMl) && { oilAmountInMl }),
        ...(isNum(sprayAmountInMl) && { sprayAmountInMl }),
        ...(concentration && { concentration }),
        ...(code && { code }),
        ...(perfumeId && { perfumeId }),
        ...(isNum(kiloBuyPrice) && { kiloBuyPrice: kiloBuyPrice!.toFixed(4) }),
        ...(isNum(kiloSellPrice) && {
          kiloSellPrice: kiloSellPrice!.toFixed(4),
        }),
        ...(isNum(kiloSellPrice) && {
          mlPrice: (kiloSellPrice! / 1000).toFixed(4),
        }),
        updatedAt: new Date(),
      })
      .where(eq(perfumesCompoundsTable.id, compId))
      .returning();

    return compound;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function remove(ownerId: number, shopId: number, compId: number) {
  try {
    await assertOwnership(shopId, ownerId);

    const [compound] = await db
      .delete(perfumesCompoundsTable)
      .where(eq(perfumesCompoundsTable.id, compId))
      .returning();

    return compound;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function queryAll(
  ownerId: number,
  shopId: number,
  filters: CompoundsQueryFilters,
) {
  try {
    const shop = await assertOwnership(shopId, ownerId);
    const conditions = prepareCompFilters(filters);
    const { page = 1, limit = 20 } = filters;

    const compounds = await db
      .select()
      .from(perfumesCompoundsTable)
      .where(and(eq(perfumesCompoundsTable.shopId, shopId), ...conditions))
      .offset((page - 1) * limit)
      .limit(limit);

    if (compounds.length === 0) return [];

    return compounds.map(({ updatedAt, ...comp }) => ({
      ...comp,
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
  compId: number,
) {
  try {
    const shop = await assertOwnership(shopId, ownerId);

    const [compound] = await db
      .select()
      .from(perfumesCompoundsTable)
      .where(eq(perfumesCompoundsTable.id, compId));

    if (!compound) return null;

    const { updatedAt, ...comp } = compound;
    return {
      ...comp,
      shopName: shop.name,
      ...(shop.logo && { shopLogo: shop.logo }),
    };
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

// AGING
export async function addAging(
  ownerId: number,
  shopId: number,
  compId: number,
  agingBody: CreateAgingBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const { newAging, useAlcohol } = agingBody;

    const result = await db.transaction(async (tx) => {
      const [aging] = await tx
        .insert(agingTable)
        .values({
          ...newAging,
          startDate:
            newAging.startDate === "now"
              ? new Date()
              : new Date(newAging.startDate),
          endDate: new Date(newAging.endDate),
          compoundId: compId,
        })
        .returning();

      if (!aging) tx.rollback();
      if (!useAlcohol) return aging;

      const oilAmount = newAging.amount * (newAging.concentration / 100);
      const alcoAmount = newAging.amount - oilAmount;

      const [alcohol] = await alcoholService.decreaseStock(
        [{ alcoholId: aging!.alcoholId, amountInMl: alcoAmount }],
        tx,
      );

      if (!alcohol) tx.rollback();

      return aging;
    });

    return result;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function updateAging(
  ownerId: number,
  shopId: number,
  compId: number,
  agingId: number,
  updatesBody: UpdateAgingBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const { updates, retrieveAcohol } = updatesBody;

    const result = await db.transaction(async (tx) => {
      const [aging] = await db
        .update(agingTable)
        .set({
          ...(updates.amount && { amount: updates.amount }),
          ...(updates.startDate && {
            startDate:
              updates.startDate === "now"
                ? new Date()
                : new Date(updates.startDate),
          }),
          ...(updates.endDate && { endDate: new Date(updates.endDate) }),
          ...(updates.alcoholId && { alcoholId: updates.alcoholId }),
          updatedAt: new Date(),
        })
        .where(
          and(eq(agingTable.id, agingId), eq(agingTable.compoundId, compId)),
        )
        .returning();

      if (!aging) tx.rollback();

      if (!retrieveAcohol || !updates.amount) return aging;

      const oilAmount = updates.amount * (aging!.concentration / 100);
      const alcoAmount = updates.amount - oilAmount;

      const alcohol = await alcoholService.increaseStock(
        aging!.alcoholId,
        alcoAmount,
        tx,
      );

      if (!alcohol) tx.rollback();

      return aging;
    });

    return result;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function deleteAging(
  ownerId: number,
  shopId: number,
  compId: number,
  agingId: number,
  retrieveAcohol: boolean,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const result = await db.transaction(async (tx) => {
      const [aging] = await db
        .delete(agingTable)
        .where(
          and(eq(agingTable.id, agingId), eq(agingTable.compoundId, compId)),
        )
        .returning();

      if (!aging) tx.rollback();
      if (!retrieveAcohol) return aging;

      const oilAmount = aging!.amount * (aging!.concentration / 100);
      const alcoAmount = aging!.amount - oilAmount;

      const alcohol = await alcoholService.increaseStock(
        aging!.alcoholId,
        alcoAmount,
        tx,
      );

      if (!alcohol) tx.rollback();

      return aging;
    });

    return result;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function queryCompAgings(
  ownerId: number,
  shopId: number,
  compId: number,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const compAgings = await db
      .select()
      .from(agingTable)
      .where(eq(agingTable.compoundId, compId));

    return compAgings;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function queryCompAgingById(
  ownerId: number,
  shopId: number,
  agingId: number,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const [compAging] = await db
      .select()
      .from(agingTable)
      .where(eq(agingTable.id, agingId));

    return compAging;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function increaseStock(
  decrement: { compId: number; spray?: number; oil?: number },
  higherTx?: DbTx,
) {
  try {
    const _db = higherTx ?? db;
    const [compound] = await _db
      .update(perfumesCompoundsTable)
      .set({
        sprayAmountInMl: sql`${perfumesCompoundsTable.sprayAmountInMl} + ${Math.abs(decrement.spray || 0)}`,
        oilAmountInMl: sql`${perfumesCompoundsTable.oilAmountInMl} + ${Math.abs(decrement.oil || 0)}`,
        updatedAt: new Date(),
      })
      .where(eq(perfumesCompoundsTable.id, decrement.compId))
      .returning();

    return compound;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    // if (e instanceof TransactionRollbackError) {
    //   throw e;
    // }
    throw e;
  }
}

export async function decreaseStock(
  amounts: { compId: number; spray?: number; oil?: number }[],
  higherTx?: DbTx,
) {
  try {
    const _db = higherTx ?? db;

    const result = await _db.transaction(async (tx) => {
      const decrements = sql.join(
        amounts.map(
          (obj) =>
            sql`(${obj.compId}, ${Math.abs(obj.spray || 0)}, ${Math.abs(obj.oil || 0)})`,
        ),
        sql`, `,
      );

      const rows = (await tx.execute(sql`
        UPDATE perfumes_compounds AS pc
        SET  oil_amount_in_ml = oil_amount_in_ml - decs.oil,
          spray_amount_in_ml = spray_amount_in_ml - decs.spray,
          updated_at = NOW()
        FROM (VALUES ${decrements}) AS decs(comp_id, spray, oil)
        WHERE pc.id = decs.comp_id
          AND oil_amount_in_ml >= decs.oil
          AND spray_amount_in_ml >= decs.spray
        RETURNING pc.id AS id, pc.oil_amount_in_ml AS "oilAmount", pc.spray_amount_in_ml AS "sprayAmount"
      `)) as { id: number; oilAmount: number; sprayAmount: number }[];

      if (rows.length !== amounts.length) tx.rollback();

      return rows;
    });

    return result;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
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
    minOilSellPrice,
    maxOilSellPrice,
    minSpraySellPrice,
    maxSpraySellPrice,
    minConcentration,
    maxConcentration,
    agingEndsBefore,
  } = filters;

  const conditions = [];

  if (search) conditions.push(ilike(perfumesTable.name, `%${search}%`));
  if (companyName)
    conditions.push(ilike(companiesTable.name, `%${companyName}%`));
  if (code) conditions.push(ilike(perfumesCompoundsTable.code, `%${code}%`));
  if (minOilAmount !== undefined)
    conditions.push(gte(perfumesCompoundsTable.oilAmountInMl, minOilAmount));
  if (maxOilAmount !== undefined)
    conditions.push(lte(perfumesCompoundsTable.oilAmountInMl, maxOilAmount));
  if (minSprayAmount !== undefined)
    conditions.push(
      gte(perfumesCompoundsTable.sprayAmountInMl, minSprayAmount),
    );
  if (maxSprayAmount !== undefined)
    conditions.push(
      lte(perfumesCompoundsTable.sprayAmountInMl, maxSprayAmount),
    );
  if (minOilSellPrice !== undefined)
    conditions.push(
      gte(perfumesCompoundsTable.mlPrice, minOilSellPrice.toFixed(4)),
    );
  if (maxOilSellPrice !== undefined)
    conditions.push(
      lte(perfumesCompoundsTable.mlPrice, maxOilSellPrice.toFixed(4)),
    );
  // if (minSpraySellPrice !== undefined) conditions.push(gte(perfumesCompoundsTable.oilAmountInMl, minOilAmount));
  // if (maxSpraySellPrice !== undefined) conditions.push(lte(perfumesCompoundsTable.oilAmountInMl, minOilAmount));
  if (minConcentration !== undefined)
    conditions.push(
      gte(perfumesCompoundsTable.concentration, minConcentration),
    );
  if (maxConcentration !== undefined)
    conditions.push(
      lte(perfumesCompoundsTable.concentration, maxConcentration),
    );
  if (agingEndsBefore)
    conditions.push(lte(agingTable.endDate, new Date(agingEndsBefore)));

  return conditions;
}
