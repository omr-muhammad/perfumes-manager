import Elysia from "elysia";
import { protect, restrictTo } from "../../../utils/auth";
import * as handlers from "./handlers";
import { ShopParams } from "../../../utils/globalSchema";
import { CompParams, CreateCompoundBody, UpdateCompoundBody } from "./schema";

export const perfumesCompoundsRouter = new Elysia({ prefix: "/compounds" })
  .use(protect)
  .use(restrictTo("owner"))
  .group("/", (app) =>
    app.post("/", handlers.createComp, {
      params: ShopParams,
      body: CreateCompoundBody,
    }),
  )
  .group("/:compId", (app) =>
    app.patch("", handlers.updateComp, {
      params: CompParams,
      body: UpdateCompoundBody,
    }),
  );
