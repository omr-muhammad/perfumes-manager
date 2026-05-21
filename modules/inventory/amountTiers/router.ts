import Elysia from "elysia";
import { protect } from "../../../utils/auth";
import type { AlcoLotParams } from "../alcohols/schema";
import * as handlers from "./handlers";
import { TierSchema, type TierCTXs } from "./schema";
import type { BottleLotParams } from "../bottles/schema";
import type { CompLotParams } from "../perfumeCompounds/schema";
import { AppError } from "../../../utils/AppError";
import { discountTypeEn } from "../../../db/schema/enums";

// Alcohols
export const alcoAmountRouter = new Elysia()
  .use(protect)
  .resolve(({ params }: { params: AlcoLotParams }) => ({
    meta: {
      entityType: "alcohol" as const,
      entityId: params.alcoholId,
    },
  }))
  .post("", handlers.addAmountTier, {
    ...TierSchema.create,
    beforeHandle,
  })
  .patch("/:tierId", handlers.updateAmountTier, TierSchema.update)
  .delete("/:tierId", handlers.deleteAmountTier, TierSchema.delete);

// Bottles
export const btlAmountRouter = new Elysia()
  .use(protect)
  .resolve(({ params }: { params: BottleLotParams }) => ({
    meta: {
      entityType: "bottle" as const,
      entityId: params.bottleId,
    },
  }))
  .post("", handlers.addAmountTier, {
    ...TierSchema.create,
    beforeHandle,
  })
  .patch("/:tierId", handlers.updateAmountTier, TierSchema.update)
  .delete("/:tierId", handlers.deleteAmountTier, TierSchema.delete);

// Perfume Compounds
export const compAmountRouter = new Elysia()
  .use(protect)
  .resolve(({ params }: { params: CompLotParams }) => ({
    meta: {
      entityType: "bottle" as const,
      entityId: params.compId,
    },
  }))
  .post("", handlers.addAmountTier, {
    ...TierSchema.create,
    beforeHandle,
  })
  .patch("/:tierId", handlers.updateAmountTier, TierSchema.update)
  .delete("/:tierId", handlers.deleteAmountTier, TierSchema.delete);

// Validate create tier body
function beforeHandle({ body }: TierCTXs["create"]) {
  if (body.pricingType === "discount") {
    const allowedDiscountType = discountTypeEn.enumValues;
    if (!allowedDiscountType.includes(body.discountType!))
      throw new AppError(
        422,
        `Discount Type can only be one of (${allowedDiscountType.join(", ")}) when pricing type set to 'discount'`,
      );

    if (body.value < 0 || body.value > 100)
      throw new AppError(422, `Discount percentage must be between 1 and 100.`);
  }
}
