import Elysia from "elysia";
import * as handlers from "./handlers";
import {
  CreateShopBody,
  ShopsQueryFilters,
  StaffBody,
  UpdateShopBody,
  UpdateStaffBody,
} from "./schema";
import {
  AddressBase,
  ShopParams,
  TStaffParams,
} from "../../utils/globalSchema";
import { protect, restrictTo } from "../../utils/auth";
import { alcoholsRouter } from "../inventory/alcohols/router";
import { bottlesRouter } from "../inventory/bottles/router";
import { perfumesCompoundsRouter } from "../inventory/perfumeCompounds/router";

export const shopsRouter = new Elysia({ prefix: "shops" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("/", handlers.createNewShop, {
    beforeHandle({ authPayload, body, status }) {
      if (authPayload.role === "admin")
        if (body.ownerId === undefined) return status(422);
    },
    body: CreateShopBody,
  })
  .get("/", handlers.getShops, {
    query: ShopsQueryFilters,
  })
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
      .put("/address", handlers.upsertShopAddress, {
        params: ShopParams,
        body: AddressBase,
      })
      .group("/staff", (app) =>
        app
          .post("", handlers.createShopStaff, {
            params: TStaffParams,
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
