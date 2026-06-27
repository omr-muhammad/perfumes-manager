import Elysia from "elysia";
import { protect, restrictTo } from "../../utils/auth";
import * as handlers from "./handlers";
import { PfCompSchema } from "./schema";

export const compAdminRouter = new Elysia({ prefix: "/compounds" })
  .use(protect)
  .use(restrictTo("admin"))
  .post("", handlers.createPfComp, PfCompSchema.create)
  .patch("/:compoundId", handlers.updatePfComp, PfCompSchema.update)
  .delete("/:compoundId", handlers.deletePfComp, PfCompSchema.delete);
