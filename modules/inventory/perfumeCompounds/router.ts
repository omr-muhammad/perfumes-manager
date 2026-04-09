import Elysia from "elysia";
import { protect, restrictTo } from "../../../utils/auth";
import * as handlers from "./handlers";

export const perfumesCompoundsRouter = new Elysia({ prefix: "/compounds" })
  .use(protect)
  .use(restrictTo("owner"));
