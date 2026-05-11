import Elysia from "elysia";

import { protect, restrictTo } from "../../../utils/auth";
import * as handlers from "./handlers";
import { BottleSchema } from "./schema";

export const bottlesRouter = new Elysia({ prefix: "/bottles" })
  .use(protect)
  .use(restrictTo("owner"))
  .get("", handlers.getShopBottles, BottleSchema.qAll)
  .post("", handlers.createBtl, BottleSchema.create)

  // /inventory/bottles/:bottleId
  .group("/:bottleId", (app) =>
    app
      .get("", handlers.getBtlById, BottleSchema.qOne)
      .patch("", handlers.updateBtl, BottleSchema.update)
      .delete("", handlers.deleteBtl, BottleSchema.del)

      // /inventory/bottles/:bottleId/lots
      .group("/lots", (app) =>
        app
          .post("", handlers.createBtlLot, BottleSchema.createLot)

          // /inventory/bottles/:bottleId/lots/:lotId
          .group("/:lotId", (app) =>
            app
              .patch("", handlers.updateBtlLot, BottleSchema.updateLot)
              .delete("", handlers.deleteBtlLot, BottleSchema.deleteLot)

              // /inventory/bottles/:bottleId/lots/:lotId/amount-tiers
              .group("/amount-tiers", (app) =>
                app
                  .post("", handlers.addAmountTier, BottleSchema.addAmountTier)
                  .patch(
                    "/:tierId",
                    handlers.updateAmountTier,
                    BottleSchema.updateAmountTier,
                  )
                  .delete(
                    "/:tierId",
                    handlers.deleteAmountTier,
                    BottleSchema.delAmountTier,
                  ),
              ),
          ),
      ),
  );
