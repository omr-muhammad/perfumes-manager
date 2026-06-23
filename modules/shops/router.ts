import Elysia from "elysia";
import * as handlers from "./handlers";
import { ShopSchema } from "./schema";

import { protect, restrictTo } from "../../utils/auth";

import { alcoholsRouter } from "../inventory/alcohols/router";
import { bottlesRouter } from "../inventory/bottles/router";
import { perfumesCompoundsRouter } from "../inventory/shopCompounds/router";
import { orderRouter } from "../orders/router";

export const shopsRouter = new Elysia({ prefix: "/shops" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("", handlers.createNewShop, ShopSchema.CreateShop)
  .get("", handlers.getShops, ShopSchema.Query)

  // /api/shops/:shopId
  .group("/:shopId", (app) =>
    app
      .get("", handlers.getShopById, ShopSchema.QueryById)
      .patch("", handlers.updateMyShop, ShopSchema.UpdateShop)
      .delete("", handlers.deleteShopById, ShopSchema.DelShop)
      .put("/address", handlers.upsertShopAddress, ShopSchema.UpsertShopAddress)
      .patch("/visible", handlers.hideShop, ShopSchema.Visibility)

      // /api/shops/:shopId/orders
      .use(orderRouter)

      // /api/shops/:shopId/staff/
      .group("/staff", (app) =>
        app
          .get("", handlers.getShopStaff, ShopSchema.QueryShopStaff)
          .post("", handlers.createShopStaff, ShopSchema.CreateStaff)
          .patch("/:staffId", handlers.updateShopStaff, ShopSchema.UpdateStaff)
          .delete("/:staffId", handlers.removeShopStaff, ShopSchema.DelStaff),
      )

      // /api/shops/:shopId/inventory/
      .group("/inventory", (app) =>
        app.use(alcoholsRouter).use(bottlesRouter).use(perfumesCompoundsRouter),
      ),
  );
