import { and, eq } from "drizzle-orm";
import { db } from "../../../db/config";
import {
  alcoholsTable,
  amountTiersTable,
  bottlesTable,
  shopCompsTable,
} from "../../../db/schema";
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

  await validateEntity(meta, newAmountTier.pricingType, value);

  const [tier] = await db
    .insert(amountTiersTable)
    .values({
      ...rest,
      ...meta,
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

  await validateEntity(meta, updates.pricingType, value);

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

async function validateEntity(
  { entityId, entityType }: AmountTierMeta,
  priceType?: CreateTier["pricingType"],
  value?: number,
) {
  const tablesMap = {
    alcohol: alcoholsTable,
    bottle: bottlesTable,
    shop_compound: shopCompsTable,
  };

  // Validate FK Ref
  const entTable = tablesMap[entityType];
  const [entity] = await db
    .select()
    .from(entTable)
    .where(eq(entTable.id, entityId));

  if (!entity)
    throw new AppError(
      404,
      `${entityId} is not a valid ${entityType.replace("_", " ")} reference, Record not found.`,
    );

  // Validate Price

  // @ts-expect-error
  // prettier-ignore
  const basePrice = entity.baseSellPerLiter || entity.baseSellPerKilo || entity.baseSellPrice;

  if (!priceType || !value)
    throw new AppError(422, "Pricing type or Price is missing.");

  if (priceType === "fixed" && value >= basePrice)
    throw new AppError(
      400,
      `Tier price value must be less than base price in, ${value} is not less than or equal ${basePrice}.`,
    );
}
