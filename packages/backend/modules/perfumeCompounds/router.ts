import Elysia from "elysia";
import { protect, restrictTo } from "../../utils/auth";

import * as handlers from "./handlers";
import { PfCompSchema } from "./schema";

export const pfCompRouter = new Elysia({ name: "/compounds" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("", handlers.createPfComp, PfCompSchema.create);
