import Elysia from "elysia";
import * as handlers from "./handlers";
import { TParams } from "../../../utils/globalSchema";
import { CreateAlcoBody } from "./schema";
import { protect, restrictTo } from "../../../utils/auth";

export const alcoholsRouter = new Elysia({ prefix: "/alcohols" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("/", handlers.createAlco, {
    params: TParams,
    body: CreateAlcoBody,
  });
