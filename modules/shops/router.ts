import Elysia from "elysia";
import * as handlers from "./handlers";
import { ShopSchema } from "./schema";

import { protect, restrictTo } from "../../utils/auth";
import { AppError } from "../../utils/AppError";

import { alcoholsRouter } from "../inventory/alcohols/router";
import { bottlesRouter } from "../inventory/bottles/router";
import { perfumesCompoundsRouter } from "../inventory/perfumeCompounds/router";

export const shopsRouter = new Elysia({ prefix: "/shops" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("", handlers.createNewShop, {
    beforeHandle({ authPayload, body }) {
      if (authPayload.role === "admin" && !body.ownerId)
        throw new AppError(422, "shop id is required to create a shop");
    },
    ...ShopSchema.CreateShop,
  })
  .get("", handlers.getShops, ShopSchema.Query)
  .group("/:shopId", (app) =>
    app
      .get("", handlers.getShopById, ShopSchema.QueryById)
      .delete("", handlers.deleteShopById, ShopSchema.DelShop)
      .patch("", handlers.updateMyShop, ShopSchema.UpdateShop)
      .put("/address", handlers.upsertShopAddress, ShopSchema.UpsertShopAddress)
      .patch("/:shopId/visible", handlers.hideShop, ShopSchema.Visibility)

      // Shop Staff
      .group("/staff", (app) =>
        app
          .post("", handlers.createShopStaff, ShopSchema.CreateStaff)
          .delete("/:staffId", handlers.removeShopStaff, ShopSchema.DelStaff)
          .get("", handlers.getShopStaff, ShopSchema.QueryShopStaff)
          .patch(":staffId", handlers.updateShopStaff, ShopSchema.UpdateStaff),
      )
      // url /api/shops/:shopId/inventory/
      .group("/inventory", (app) =>
        app.use(alcoholsRouter).use(bottlesRouter).use(perfumesCompoundsRouter),
      ),
  );
