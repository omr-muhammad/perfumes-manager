import Elysia from "elysia";
import { protect, restrictTo } from "../../../utils/auth";
import * as handlers from "./handlers";
import { ShopParams } from "../../../utils/globalSchema";
import { CreateBottleBody } from "./schema";

export const bottlesRouter = new Elysia({ prefix: "/bottles" })
  .use(protect)
  .use(restrictTo("owner"))
  .group("/", (app) =>
    app.post("/", handlers.createBtl, {
      params: ShopParams,
      body: CreateBottleBody,
    }),
  );
