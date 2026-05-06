import Elysia from "elysia";

import { protect, restrictTo } from "../../../utils/auth";
import * as handlers from "./handlers";
import { BottleSchema } from "./schema";

export const bottlesRouter = new Elysia({ prefix: "/bottles" })
  .use(protect)
  .use(restrictTo("owner"))
  .get("", handlers.getShopBottles, BottleSchema.qAll)
  .post("", handlers.createBtl, BottleSchema.create)
  .group("/:bottleId", (app) =>
    app
      .get("", handlers.getBtlById, BottleSchema.qOne)
      .patch("", handlers.updateBtl, BottleSchema.update)
      .delete("", handlers.deleteBtl, BottleSchema.del)
      .group("/lots", (app) =>
        app
          .post("", handlers.createBtlLot, BottleSchema.createLot)
          .patch("/:lotId", handlers.updateBtlLot, BottleSchema.updateLot)
          .delete("/:lotId", handlers.deleteBtlLot, BottleSchema.deleteLot),
      ),
  );
