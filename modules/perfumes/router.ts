import Elysia from "elysia";
import * as handlers from "./handlers";
import { ContextSchema } from "./schema";
import { protect, restrictTo } from "../../utils/auth";

export const perfumesRouter = new Elysia({ prefix: "/perfumes" })
  .use(protect)
  .use(restrictTo("admin", "owner"))
  .get("", handlers.getPerfumes, ContextSchema.QueryPf)
  .post("", handlers.createPerfume, ContextSchema.CreatePf);
