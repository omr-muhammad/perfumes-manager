import Elysia from "elysia";
import { protect } from "../../utils/auth";
import * as handlers from "./handlers";
import { ShopSchema } from "./schema";

export const shopsAdminRouter = new Elysia()
  .use(protect)
  .get("", handlers.getShops)
  .get("/:shopId", handlers.getShopById, ShopSchema.QueryById)
  .delete("/:shopId", handlers.deleteShopById, ShopSchema.DelShop)
  .patch("/:shopId", handlers.handleShopActivation, ShopSchema.Activation);
