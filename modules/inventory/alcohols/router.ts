import Elysia from "elysia";
import * as handlers from "./handlers";
import { AlcoInvParams, ShopParams } from "../../../utils/globalSchema";
import { CreateAlcoBody, UpdateAlcoBody } from "./schema";
import { protect, restrictTo } from "../../../utils/auth";

export const alcoholsRouter = new Elysia({ prefix: "/alcohols" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("/", handlers.createAlco, {
    params: ShopParams,
    body: CreateAlcoBody,
  })
  .get("/", handlers.getAllAlcoInv, {
    params: ShopParams,
  })
  .group("/:alcoholId", (app) =>
    app
      .patch("/", handlers.updateAlco, {
        params: AlcoInvParams,
        body: UpdateAlcoBody,
      })
      .delete("/", handlers.deleteAlco, {
        params: AlcoInvParams,
      })
      .get("/", handlers.getAlcoById, {
        params: AlcoInvParams,
      }),
  );
