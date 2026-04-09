import { db } from "../../../db/config";
import { perfumesCompoundsTable } from "../../../db/schema";
import { assertOwnership } from "../../../utils/assertOwnership";
import type { UpdateCompanyBody } from "../../companies/schema";
import type { CreateCompoundBody, UpdateCompoundBody } from "./schema";

export async function create(
  ownerId: number,
  shopId: number,
  newComp: CreateCompoundBody,
) {
  try {
    await assertOwnership(shopId, ownerId);

    const mlPrice = Math.ceil(newComp.kiloSellPrice / 1000);

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

    return compound;
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
      .returning();

    return compound;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}
