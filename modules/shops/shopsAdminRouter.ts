import Elysia from "elysia";
import { protect } from "../../utils/auth";
import * as handlers from "./handlers";
import { CreateShopBody, HideShopBody } from "./schema";
import { HandleActiveBody, ShopParams } from "../../utils/globalSchema";

export const shopsAdminRouter = new Elysia()
  .use(protect)
  .post("/", handlers.createNewShop, {
    body: CreateShopBody,
  })
  .get("/", handlers.getShops)
  .get("/:shopId", handlers.getShopById, {
    params: ShopParams,
  })
  .delete("/:shopId", handlers.deleteShop, {
    params: ShopParams,
  })
  .patch("/:shopId", handlers.handleShopActivation, {
    params: ShopParams,
    body: HandleActiveBody,
  })
  .patch("/:shopId", handlers.hideShop, {
    params: ShopParams,
    body: HideShopBody,
  });
