import Elysia from "elysia";
import { protect, restrictTo } from "../../../utils/auth";
import * as handlers from "./handlers";
import { ShopParams } from "../../../utils/globalSchema";
import { CreateCompoundBody } from "./schema";

export const perfumesCompoundsRouter = new Elysia({ prefix: "/compounds" })
  .use(protect)
  .use(restrictTo("owner"))
  .group("/", (app) =>
    app.post("/", handlers.createComp, {
      params: ShopParams,
      body: CreateCompoundBody,
    }),
  );
