import Elysia from "elysia";
import { authJWTPlugin } from "../../utils/jwtPlugins";
import * as handlers from "./handlers";
import { CreateShopBody, UpdateAddressBody, UpdateShopBody } from "./schema";
import { TParams } from "../../utils/globalSchema";

export const shopsRouter = new Elysia({ prefix: "shops" })
  .use(authJWTPlugin)
  .resolve(async ({ cookie: { authToken }, authJWT }) => {
    if (!authToken || typeof authToken.value !== "string")
      throw new Error("Unauthorized.");

    const token = authToken.value;
    const payload = await authJWT.verify(token);

    if (!payload) throw new Error("Unauthorized.");

    if (!["admin", "owner"].includes(payload.role))
      throw new Error("Forbidden");
    // console.log("payload", payload);
    return { authPayload: payload };
  })
  .post("/", handlers.createNewShop, {
    body: CreateShopBody,
  })
  .patch("/:id", handlers.updateShop, {
    params: TParams,
    body: UpdateShopBody,
  })
  .patch("/:id/address", handlers.updateShopAddress, {
    params: TParams,
    body: UpdateAddressBody,
  })
  .delete("/:id", handlers.deleteShop, {
    params: TParams,
  })
  .get("/", handlers.getShops)
  .get("/:id", handlers.getShopById, {
    params: TParams,
  });
