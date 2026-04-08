import Elysia from "elysia";
import * as handlers from "./handlers";
import {
  CreateShopBody,
  StaffBody,
  UpdateAddressBody,
  UpdateShopBody,
  UpdateStaffBody,
} from "./schema";
import { ShopParams, TStaffParams } from "../../utils/globalSchema";
import { alcoholsRouter } from "../inventory/alcohols/router";
import { protect, restrictTo } from "../../utils/auth";
import { bottlesRouter } from "../inventory/bottles/router";

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
        params: ShopParams,
      })
      .delete("/", handlers.deleteShop, {
        params: ShopParams,
      })
      .use(restrictTo("owner"))
      .patch("/", handlers.updateShop, {
        params: ShopParams,
        body: UpdateShopBody,
      })
      .patch("/address", handlers.updateShopAddress, {
        params: ShopParams,
        body: UpdateAddressBody,
      })
      .post("/staff", handlers.addShopStaff, {
        params: ShopParams,
        body: StaffBody,
      })
      .delete("/staff/:staffId", handlers.removeShopStaff, {
        params: TStaffParams,
      })
      .get("/staff", handlers.getShopStaff, {
        params: ShopParams,
      })
      .patch("/staff/:staffId", handlers.updateShopStaff, {
        params: TStaffParams,
        body: UpdateStaffBody,
      })
      // url /api/shops/:shopId/inventory/
      .group("/inventory", (app) => app.use(alcoholsRouter).use(bottlesRouter)),
  );
