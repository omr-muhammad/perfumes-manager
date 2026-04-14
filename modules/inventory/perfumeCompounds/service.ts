import { and, eq } from "drizzle-orm";
import { db } from "../../../db/config";
import { agingTable, perfumesCompoundsTable } from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type {
  CreateAging,
  CreateCompBody,
  UpdateAging,
  UpdateCompoundBody,
} from "./schema";

export async function create(
  ownerId: number,
  shopId: number,
  compData: CreateCompBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const { compound: newComp, aging: newAging } = compData;
    const mlPrice = newComp.kiloSellPrice / 1000;

    const [compound] = await db
      .insert(perfumesCompoundsTable)
      .values({
        ...newComp,
        kiloBuyPrice: newComp.kiloBuyPrice.toFixed(4),
        kiloSellPrice: newComp.kiloSellPrice.toFixed(4),
        mlPrice: mlPrice.toFixed(4),
        shopId,
      })
      .returning();

    if (!compound) return null;
    if (!newAging) return compound;

    const [aging] = await db
      .insert(agingTable)
      .values({
        amount: newAging.amount,
        startDate:
          newAging.startDate === "now"
            ? new Date()
            : new Date(newAging.startDate),
        endDate: new Date(newAging.endDate),
        compoundId: compound.id,
        alcoholId: newAging.alcoholId,
      })
      .returning();

    // BAD!! => Tx later
    if (!aging) return compound;

    return { ...compound, aging };
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

export async function queryAll(ownerId: number, shopId: number) {
  try {
    const shop = await assertOwnership(shopId, ownerId);

    const compounds = await db
      .select()
      .from(perfumesCompoundsTable)
      .where(eq(perfumesCompoundsTable.shopId, shopId));

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
  newAging: CreateAging,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const [aging] = await db
      .insert(agingTable)
      .values({
        amount: newAging.amount,
        startDate:
          newAging.startDate === "now"
            ? new Date()
            : new Date(newAging.startDate),
        endDate: new Date(newAging.endDate),
        compoundId: compId,
        alcoholId: newAging.alcoholId,
      })
      .returning();

    return aging;
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
  updates: UpdateAging,
) {
  try {
    await assertOwnership(shopId, ownerId);

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
      .where(and(eq(agingTable.id, agingId), eq(agingTable.compoundId, compId)))
      .returning();

    return aging;
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
) {
  try {
    await assertOwnership(shopId, ownerId);

    const [aging] = await db
      .delete(agingTable)
      .where(and(eq(agingTable.id, agingId), eq(agingTable.compoundId, compId)))
      .returning();

    return aging;
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
