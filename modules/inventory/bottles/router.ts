import Elysia from "elysia";

import { protect, restrictTo } from "../../../utils/auth";
import * as handlers from "./handlers";
import { BottleSchema } from "./schema";
import { btlAmountRouter } from "../amountTiers/router";

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
      .post("/lots", handlers.createBtlLot, BottleSchema.createLot)

      // /inventory/bottles/:bottleId/lots/:lotId
      .group("/lots/:lotId", (app) =>
        app
          .patch("", handlers.updateBtlLot, BottleSchema.updateLot)
          .delete("", handlers.deleteBtlLot, BottleSchema.deleteLot)
          .patch("/stock", handlers.updateLotStock, BottleSchema.updateLotStock)

          // /inventory/bottles/:bottleId/lots/:lotId/amount-tiers
          .group("/amount-tiers", (app) => app.use(btlAmountRouter)),
      ),
  );
