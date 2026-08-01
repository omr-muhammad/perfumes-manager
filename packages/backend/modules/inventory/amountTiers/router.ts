import Elysia from "elysia";
import { protect } from "../../../utils/auth";
import type { AlcoLotParams } from "../alcohols/schema";
import * as handlers from "./handlers";
import { TierSchema, type TierCTXs } from "./schema";
import type { BottleLotParams } from "../bottles/schema";
import type { CompLotParams } from "../shopCompounds/schema";
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
    detail: {
      summary: "Add a pricing amount tier to an alcohol lot",
      description:
        "For discount pricing, value must be a percentage between 1 and 100.",
      tags: ["Inventory - Alcohols"],
    },
  })
  .patch("/:tierId", handlers.updateAmountTier, {
    ...TierSchema.update,
    detail: {
      summary: "Update an alcohol lot's amount tier",
      tags: ["Inventory - Alcohols"],
    },
  })
  .delete("/:tierId", handlers.deleteAmountTier, {
    ...TierSchema.delete,
    detail: {
      summary: "Delete an alcohol lot's amount tier",
      tags: ["Inventory - Alcohols"],
    },
  });

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
    detail: {
      summary: "Add a pricing amount tier to a bottle lot",
      description:
        "For discount pricing, value must be a percentage between 1 and 100.",
      tags: ["Inventory - Bottles"],
    },
  })
  .patch("/:tierId", handlers.updateAmountTier, {
    ...TierSchema.update,
    detail: {
      summary: "Update a bottle lot's amount tier",
      tags: ["Inventory - Bottles"],
    },
  })
  .delete("/:tierId", handlers.deleteAmountTier, {
    ...TierSchema.delete,
    detail: {
      summary: "Delete a bottle lot's amount tier",
      tags: ["Inventory - Bottles"],
    },
  });

// Perfume Compounds
export const compAmountRouter = new Elysia()
  .use(protect)
  .resolve(({ params }: { params: CompLotParams }) => ({
    meta: {
      entityType: "shop_compound" as const,
      entityId: params.shopCompId,
    },
  }))
  .post("", handlers.addAmountTier, {
    ...TierSchema.create,
    beforeHandle,
    detail: {
      summary: "Add a pricing amount tier to a shop compound lot",
      description:
        "For discount pricing, value must be a percentage between 1 and 100.",
      tags: ["Inventory - Shop Compounds"],
    },
  })
  .patch("/:tierId", handlers.updateAmountTier, {
    ...TierSchema.update,
    detail: {
      summary: "Update a shop compound lot's amount tier",
      tags: ["Inventory - Shop Compounds"],
    },
  })
  .delete("/:tierId", handlers.deleteAmountTier, {
    ...TierSchema.delete,
    detail: {
      summary: "Delete a shop compound lot's amount tier",
      tags: ["Inventory - Shop Compounds"],
    },
  });

// Validate create tier body
function beforeHandle({ body }: TierCTXs["create"]) {
  if (body.pricingType === "discount") {
    if (body.value < 0 || body.value > 100)
      throw new AppError(422, `Discount percentage must be between 1 and 100.`);
  }
}
