import Elysia from "elysia";
import * as handlers from "./handlers";
import { TAlcoParams, TParams } from "../../../utils/globalSchema";
import { CreateAlcoBody, UpdateAlcoBody } from "./schema";
import { protect, restrictTo } from "../../../utils/auth";
import { app } from "../../..";

export const alcoholsRouter = new Elysia({ prefix: "/alcohols" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("/", handlers.createAlco, {
    params: TParams,
    body: CreateAlcoBody,
  })
  .group("/:alcoholId", (app) =>
    app.patch("/", handlers.updateAlco, {
      params: TAlcoParams,
      body: UpdateAlcoBody,
    }),
  );
