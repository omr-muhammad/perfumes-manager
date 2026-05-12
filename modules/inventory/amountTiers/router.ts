import Elysia from "elysia";
import { protect, restrictTo } from "../../../utils/auth";
import type { AlcoLotParams } from "../alcohols/schema";
import * as handlers from "./handlers";
import { TierSchema } from "./schema";
import type { BottleLotParams } from "../bottles/schema";
import type { CompLotParams } from "../perfumeCompounds/schema";

// Alcohols
export const alcoAmountRouter = new Elysia()
  .use(protect)
  .use(restrictTo("owner"))
  .resolve(({ params }: { params: AlcoLotParams }) => ({
    meta: {
      entityType: "alcohol" as const,
      entityId: params.alcoholId,
    },
  }))
  .post("", handlers.addAmountTier, TierSchema.create)
  .patch("/:tierId", handlers.updateAmountTier, TierSchema.update)
  .delete("/:tierId", handlers.deleteAmountTier, TierSchema.delete);

// Bottles
export const btlAmountRouter = new Elysia()
  .use(protect)
  .use(restrictTo("owner"))
  .resolve(({ params }: { params: BottleLotParams }) => ({
    meta: {
      entityType: "bottle" as const,
      entityId: params.bottleId,
    },
  }))
  .post("", handlers.addAmountTier, TierSchema.create)
  .patch("/:tierId", handlers.updateAmountTier, TierSchema.update)
  .delete("/:tierId", handlers.deleteAmountTier, TierSchema.delete);

// Perfume Compounds
export const compAmountRouter = new Elysia()
  .use(protect)
  .use(restrictTo("owner"))
  .resolve(({ params }: { params: CompLotParams }) => ({
    meta: {
      entityType: "bottle" as const,
      entityId: params.compId,
    },
  }))
  .post("", handlers.addAmountTier, TierSchema.create)
  .patch("/:tierId", handlers.updateAmountTier, TierSchema.update)
  .delete("/:tierId", handlers.deleteAmountTier, TierSchema.delete);
