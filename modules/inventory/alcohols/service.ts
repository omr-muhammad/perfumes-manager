import { and, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { db } from "../../../db/config";
import { alcoholsTable, shopsTable } from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type {
  AlcoholQueryFilters,
  CreateAlcoBody,
  UpdateAlcoBody,
} from "./schema";
import type { DbTx } from "../../../utils/globalSchema";
import { AppError } from "../../../utils/AppError";

export async function create(
  ownerId: number,
  shopId: number,
  newAlco: CreateAlcoBody,
) {
  const shop = await assertOwnership(shopId, ownerId);

  const unitSellPrice = Math.ceil(newAlco.ltSellPrice / 1000);

  const [alcohol] = await db
    .insert(alcoholsTable)
    .values({
      ...newAlco,
      ltBuyPrice: newAlco.ltBuyPrice.toFixed(2),
      ltSellPrice: newAlco.ltSellPrice.toFixed(2),
      unitSellPrice: unitSellPrice.toFixed(2),
      expiryDate: new Date(newAlco.expiryDate),
      shopId,
    })
    .returning();

  if (!alcohol)
    throw new AppError(400, `Cannot create new alcohol for shop: ${shop.name}`);

  return alcohol;
}

export async function update(
  ownerId: number,
  shopId: number,
  alcoholId: number,
  updates: UpdateAlcoBody,
) {
  await assertOwnership(shopId, ownerId);

  const [alcohol] = await db
    .update(alcoholsTable)
    .set({
      ...(updates.name && { name: updates.name }),
      ...(updates.type && { type: updates.type }),
      ...(updates.concentration && { concentration: updates.concentration }),
      ...(updates.ltBuyPrice && {
        ltBuyPrice: updates.ltBuyPrice.toFixed(2),
      }),
      ...(updates.ltSellPrice && {
        ltSellPrice: updates.ltSellPrice.toFixed(2),
      }),
      ...(updates.ltSellPrice && {
        unitSellPrice: Math.ceil(updates.ltSellPrice / 1000).toFixed(2),
      }),
      ...(updates.amountInMl && { amountInMl: updates.amountInMl }),
      ...(updates.expiryDate && { expiryDate: new Date(updates.expiryDate) }),
    })
    .where(
      and(eq(alcoholsTable.shopId, shopId), eq(alcoholsTable.id, alcoholId)),
    )
    .returning();

  if (!alcohol)
    throw new AppError(404, `Alcohol with id: ${alcoholId} not found.`);

  return alcohol;
}

export async function remove(
  ownerId: number,
  shopId: number,
  alcoholId: number,
) {
  await assertOwnership(shopId, ownerId);

  const [alcohol] = await db
    .delete(alcoholsTable)
    .where(
      and(eq(alcoholsTable.shopId, shopId), eq(alcoholsTable.id, alcoholId)),
    )
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
  try {
    await assertOwnership(shopId, ownerId);

    const conditions = prepareAlcoFilters(filters);
    const { page = 1, limit = 20 } = filters;

    const alcohols = await db
      .select()
      .from(alcoholsTable)
      .innerJoin(shopsTable, eq(shopsTable.id, alcoholsTable.shopId))
      .where(and(eq(alcoholsTable.shopId, shopId), ...conditions))
      .offset((page - 1) * limit)
      .limit(limit);

    return alcohols;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function queryById(
  ownerId: number,
  shopId: number,
  alcoholId: number,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const [alcohol] = await db
      .select()
      .from(alcoholsTable)
      .innerJoin(shopsTable, eq(shopsTable.id, alcoholsTable.shopId))
      .where(eq(alcoholsTable.id, alcoholId));

    if (!alcohol)
      throw new AppError(404, `Alcohol with id: ${alcoholId} not found.`);

    return alcohol;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function increaseStock(
  alcoholId: number,
  amount: number,
  higherTx?: DbTx,
) {
  const _db = higherTx ?? db;
  const [alcohol] = await _db
    .update(alcoholsTable)
    .set({
      amountInMl: sql`${alcoholsTable.amountInMl} + ${Math.abs(amount)}`,
    })
    .where(eq(alcoholsTable.id, alcoholId))
    .returning();

  if (!alcohol)
    throw new AppError(404, `Alcohol with id: ${alcoholId} not found.`);

  return alcohol;
}

export async function decreaseStock(
  amounts: { alcoholId: number; amountInMl: number }[],
  higherTx?: DbTx,
) {
  const _db = higherTx ?? db;
  const result = (await _db.transaction(async (tx) => {
    const decrementsTable = sql.join(
      amounts.map(
        (obj) => sql`(${obj.alcoholId}, ${Math.abs(obj.amountInMl)})`,
      ),
      sql`, `,
    );

    const rows = await tx.execute(sql`
        UPDATE alcohols AS alco
        
        SET amount_in_ml = amount_in_ml - decs.amount,
          updated_at = NOW()
        
        FROM (VALUES ${decrementsTable} AS decs(alco_id, amount))
        
        WHERE alco.id = decs.alco_id
          AND alco.amount_in_ml >= decs.amount
        
        RETURNING alco.id AS id, alco.amount_in_ml AS "amountInMl";
      `);

    if (rows.length !== amounts.length) tx.rollback();

    return result;
  })) as { id: number; amountInMl: number }[];

  return result;
}

// ---------- Helpers ----------
function prepareAlcoFilters(filters: AlcoholQueryFilters) {
  const {
    search,
    type,
    minAmount,
    maxAmount,
    amountUnit,
    minLtPrice,
    maxLtPrice,
    minConcentration,
    maxConcentration,
    expiresBefore,
    expiresAfter,
  } = filters;

  const conditions = [];
  let minInMl, maxInMl;

  if (minAmount) minInMl = amountUnit === "l" ? minAmount * 1000 : minAmount;
  if (maxAmount) maxInMl = amountUnit === "l" ? maxAmount * 1000 : maxAmount;

  if (search) conditions.push(ilike(alcoholsTable.name, `%${search}%`));
  if (type) conditions.push(ilike(alcoholsTable.type, `%${type}%`));
  if (minInMl) conditions.push(gte(alcoholsTable.amountInMl, minInMl));
  if (maxInMl) conditions.push(lte(alcoholsTable.amountInMl, maxInMl));
  if (minLtPrice)
    conditions.push(gte(alcoholsTable.ltSellPrice, minLtPrice.toFixed(2)));
  if (maxLtPrice)
    conditions.push(lte(alcoholsTable.ltSellPrice, maxLtPrice.toFixed(2)));
  if (minConcentration)
    conditions.push(gte(alcoholsTable.concentration, minConcentration));
  if (maxConcentration)
    conditions.push(lte(alcoholsTable.concentration, maxConcentration));
  if (expiresBefore)
    conditions.push(lte(alcoholsTable.expiryDate, new Date(expiresBefore)));
  if (expiresAfter)
    conditions.push(gte(alcoholsTable.expiryDate, new Date(expiresAfter)));

  return conditions;
}
