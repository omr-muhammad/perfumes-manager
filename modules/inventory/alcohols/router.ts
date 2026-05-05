import Elysia from "elysia";

import { protect, restrictTo } from "../../../utils/auth";

import * as handlers from "./handlers";
import { AlcoSchema } from "./schema";

export const alcoholsRouter = new Elysia({ prefix: "/alcohols" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("", handlers.createAlco, AlcoSchema.create)
  .get("", handlers.getAllAlcoInv, AlcoSchema.queryAll)
  .group("/:alcoholId", (app) =>
    app
      .patch("", handlers.updateAlco, AlcoSchema.update)
      .delete("", handlers.deleteAlco, AlcoSchema.del)
      .get("", handlers.getAlcoById, AlcoSchema.queryOne)
      .group("/lots", (app) =>
        app
          .post("", handlers.createAlcoLot, AlcoSchema.createLot)
          .patch("/:lotId", handlers.updateAlcoLot, AlcoSchema.updateLot)
          .delete("/:lotId", handlers.deleteAlcoLot, AlcoSchema.delLot),
      ),
  );
