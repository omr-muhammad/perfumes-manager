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
import { protect, restrictTo } from "../../utils/auth";
import { alcoholsRouter } from "../inventory/alcohols/router";
import { bottlesRouter } from "../inventory/bottles/router";
import { perfumesCompoundsRouter } from "../inventory/perfumeCompounds/router";

export const shopsRouter = new Elysia({ prefix: "shops" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("/", handlers.createNewShop, {
    body: CreateShopBody,
  })
  .get("/", handlers.getShops)
  .group("/:shopId", (app) =>
    app
      .get("", handlers.getShopById, {
        params: ShopParams,
      })
      .delete("", handlers.deleteShop, {
        params: ShopParams,
      })
      .patch("", handlers.updateShop, {
        params: ShopParams,
        body: UpdateShopBody,
      })
      .patch("/address", handlers.updateShopAddress, {
        params: ShopParams,
        body: UpdateAddressBody,
      })
      .group("/staff", (app) =>
        app
          .post("", handlers.addShopStaff, {
            params: ShopParams,
            body: StaffBody,
          })
          .delete("/:staffId", handlers.removeShopStaff, {
            params: TStaffParams,
          })
          .get("", handlers.getShopStaff, {
            params: ShopParams,
          })
          .patch(":staffId", handlers.updateShopStaff, {
            params: TStaffParams,
            body: UpdateStaffBody,
          }),
      )
      // url /api/shops/:shopId/inventory/
      .group("/inventory", (app) =>
        app.use(alcoholsRouter).use(bottlesRouter).use(perfumesCompoundsRouter),
      ),
  );
