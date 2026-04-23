import Elysia from "elysia";

import { protect, restrictTo } from "../../../utils/auth";

import * as handlers from "./handlers";
import { AlcoSchema } from "./schema";

export const alcoholsRouter = new Elysia({ prefix: "/alcohols" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("", handlers.createAlco, AlcoSchema.create)
  .get("", handlers.getAllAlcoInv, AlcoSchema.queryAll)
  .patch("/:alcoholId", handlers.updateAlco, AlcoSchema.update)
  .delete("/:alcoholId", handlers.deleteAlco, AlcoSchema.del)
  .get("/:alcoholId", handlers.getAlcoById, AlcoSchema.queryOne);
