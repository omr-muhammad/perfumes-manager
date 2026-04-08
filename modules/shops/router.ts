import Elysia from "elysia";
import * as handlers from "./handlers";
import {
  CreateShopBody,
  StaffBody,
  UpdateAddressBody,
  UpdateShopBody,
  UpdateStaffBody,
} from "./schema";
import { TParams, TStaffParams } from "../../utils/globalSchema";
import { alcoholsRouter } from "../inventory/alcohols/router";
import { protect, restrictTo } from "../../utils/auth";

export const shopsRouter = new Elysia({ prefix: "shops" })
  .use(protect)
  .use(restrictTo("admin", "owner"))
  .post("/", handlers.createNewShop, {
    body: CreateShopBody,
  })
  .get("/", handlers.getShops)
  .group("/:shopId", (app) =>
    app
      .get("/", handlers.getShopById, {
        params: TParams,
      })
      .delete("/", handlers.deleteShop, {
        params: TParams,
      })
      .use(restrictTo("owner"))
      .patch("/", handlers.updateShop, {
        params: TParams,
        body: UpdateShopBody,
      })
      .patch("/address", handlers.updateShopAddress, {
        params: TParams,
        body: UpdateAddressBody,
      })
      .post("/staff", handlers.addShopStaff, {
        params: TParams,
        body: StaffBody,
      })
      .delete("/staff/:staffId", handlers.removeShopStaff, {
        params: TStaffParams,
      })
      .get("/staff", handlers.getShopStaff, {
        params: TParams,
      })
      .patch("/staff/:staffId", handlers.updateShopStaff, {
        params: TStaffParams,
        body: UpdateStaffBody,
      })
      // url /api/shops/:shopId/inventory/
      .group("/inventory", (app) => app.use(alcoholsRouter)),
  );
