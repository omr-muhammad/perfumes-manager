import Elysia from "elysia";

import { protect, restrictTo } from "../../../utils/auth";
import * as handlers from "./handlers";
import { AlcoSchema } from "./schema";

export const bottlesRouter = new Elysia({ prefix: "/bottles" })
  .use(protect)
  .use(restrictTo("owner"))
  .get("", handlers.getShopBottles, AlcoSchema.qAll)
  .post("", handlers.createBtl, AlcoSchema.create)
  .get("/:bottleId", handlers.getBtlById, AlcoSchema.qOne)
  .patch("/:bottleId", handlers.updateBtl, AlcoSchema.update)
  .delete("/:bottleId", handlers.deleteBtl, AlcoSchema.del);
