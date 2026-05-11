import Elysia from "elysia";

import { protect, restrictTo } from "../../../utils/auth";

import * as handlers from "./handlers";
import { AlcoSchema } from "./schema";

export const alcoholsRouter = new Elysia({ prefix: "/alcohols" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("", handlers.createAlco, AlcoSchema.create)
  .get("", handlers.getAllAlcoInv, AlcoSchema.queryAll)

  // /inventory/alcohols/:alcoholId
  .group("/:alcoholId", (app) =>
    app
      .patch("", handlers.updateAlco, AlcoSchema.update)
      .delete("", handlers.deleteAlco, AlcoSchema.del)
      .get("", handlers.getAlcoById, AlcoSchema.queryOne)

      // /inventory/alcohols/:alcoholId/lots
      .group("/lots", (app) =>
        app
          .post("", handlers.createAlcoLot, AlcoSchema.createLot)

          // /inventory/alcohols/:alcoholId/lots/:lotId
          .group("/:lotId", (app) =>
            app
              .patch("", handlers.updateAlcoLot, AlcoSchema.updateLot)
              .delete("", handlers.deleteAlcoLot, AlcoSchema.delLot)

              // /inventory/alcohols/:alcoholId/lots/:lotId/amount-tiers
              .group("/amount-tiers", (app) =>
                app
                  .post("", handlers.addAmountTier, AlcoSchema.addAmountTier)
                  .patch(
                    "/:tierId",
                    handlers.updateAmountTier,
                    AlcoSchema.updateAmountTier,
                  )
                  .delete(
                    "/:tierId",
                    handlers.deleteAmountTier,
                    AlcoSchema.delAmountTier,
                  ),
              ),
          ),
      ),
  );
