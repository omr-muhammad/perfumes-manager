import Elysia from "elysia";

import { protect, restrictTo } from "../../../utils/auth";

import * as handlers from "./handlers";
import { AlcoSchema } from "./schema";
import { alcoAmountRouter } from "../amountTiers/router";

export const alcoholsRouter = new Elysia({ prefix: "/alcohols" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("", handlers.createAlco, AlcoSchema.create)
  .get("", handlers.getAllAlcoInv, AlcoSchema.queryAll)

  // /inventory/alcohols/:alcoholId
  .group("/:alcoholId", (app) =>
    app
      .get("", handlers.getAlcoById, AlcoSchema.queryOne)
      .patch("", handlers.updateAlco, AlcoSchema.update)
      .delete("", handlers.deleteAlco, AlcoSchema.del)

      // /inventory/alcohols/:alcoholId/lots
      .group("/lots", (app) =>
        app
          .post("", handlers.createAlcoLot, AlcoSchema.createLot)

          // /inventory/alcohols/:alcoholId/lots/:lotId
          .patch("/:lotId", handlers.updateAlcoLot, AlcoSchema.updateLot)
          .delete("/:lotId", handlers.deleteAlcoLot, AlcoSchema.delLot)

          // /inventory/alcohols/:alcoholId/lots/:lotId/amount-tiers
          .group("/:lotId/amount-tiers", (app) => app.use(alcoAmountRouter)),
      ),
  );
