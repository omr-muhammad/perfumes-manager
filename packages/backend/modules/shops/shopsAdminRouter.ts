import Elysia from "elysia";
import { protect } from "../../utils/auth";
import * as handlers from "./handlers";
import { ShopSchema } from "./schema";

export const shopsAdminRouter = new Elysia()
  .use(protect)
  .get("", handlers.getShops, ShopSchema.AdminQuery)
  .get("/:shopId", handlers.getShopById, ShopSchema.AdminQueryById)
  .delete("/:shopId", handlers.deleteShopById, ShopSchema.AdminDelShop)
  .patch("/:shopId", handlers.handleShopActivation, ShopSchema.Activation);
