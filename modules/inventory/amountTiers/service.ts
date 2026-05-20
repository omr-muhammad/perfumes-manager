import { and, eq } from "drizzle-orm";
import { db } from "../../../db/config";
import { amountTiersTable } from "../../../db/schema";
import { AppError } from "../../../utils/AppError";
import { assertOwnership } from "../../../utils/assertOwnership";
import type {
  AmountTierMeta,
  BaseIDs,
  CreateTier,
  ExtendedIDs,
  UpdateTier,
} from "./schema";

export async function create(
  ids: BaseIDs,
  meta: AmountTierMeta,
  newAmountTier: CreateTier,
) {
  const { ownerId, shopId } = ids;

  await assertOwnership(shopId, ownerId);

  const { minAmount, maxAmount = "", value, ...rest } = newAmountTier;
  const [tier] = await db
    .insert(amountTiersTable)
    .values({
      ...rest,
      ...meta,
      shopId,
      amountRange: `[${minAmount}, ${maxAmount})`,
      value: newAmountTier.value.toFixed(4),
    })
    .returning();

  if (!tier)
    throw new AppError(400, "Cannot create new tier. try again later.");

  return tier;
}

export async function update(
  ids: ExtendedIDs,
  meta: AmountTierMeta,
  updates: UpdateTier,
) {
  const { ownerId, shopId, tierId } = ids;

  await assertOwnership(shopId, ownerId);

  const { maxAmount, minAmount, value, ...rest } = updates;
  const [tier] = await db
    .update(amountTiersTable)
    .set({
      ...rest,
      ...(minAmount &&
        maxAmount && { amountRange: `[${minAmount}, ${maxAmount})` }),
      ...(value && { value: value.toFixed(4) }),
      ...(rest.pricingType === "fixed" && {
        discountType: null,
        maxDiscountAmount: null,
      }),
    })
    .where(
      and(
        eq(amountTiersTable.id, tierId),
        eq(amountTiersTable.entityId, meta.entityId),
        eq(amountTiersTable.entityType, meta.entityType),
      ),
    )
    .returning();

  if (!tier)
    throw new AppError(
      404,
      `Amount tier with id: ${tierId} may not found or does not belong to this entity.`,
    );

  return tier;
}

export async function remove(ids: ExtendedIDs, meta: AmountTierMeta) {
  const { ownerId, shopId, tierId } = ids;

  await assertOwnership(shopId, ownerId);

  const [tier] = await db
    .delete(amountTiersTable)
    .where(
      and(
        eq(amountTiersTable.id, tierId),
        eq(amountTiersTable.entityId, meta.entityId),
        eq(amountTiersTable.entityType, meta.entityType),
      ),
    )
    .returning();

  if (!tier)
    throw new AppError(
      404,
      `Amount tier with id: ${tierId} may not found or does not belong to this ${meta.entityType}.`,
    );

  return tier;
}
