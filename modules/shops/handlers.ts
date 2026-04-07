import type { Ctx, TParams } from "../../utils/globalSchema";
import { response as res } from "../../utils/response";
import type {
  CreateShopBody,
  UpdateAddressBody,
  UpdateShopBody,
} from "./schema";
import * as shopsService from "./service";

export async function createNewShop(context: Ctx<CreateShopBody>) {
  const { authPayload, body, status } = context;

  let ownerId: number;
  if (authPayload.role === "admin") {
    if (body.ownerId === undefined) return status(422);

    ownerId = body.ownerId;
  } else ownerId = authPayload.userId;

  const shop = await shopsService.create(ownerId, body, body.address);

  return res.ok("Shop created", { shop });
}

export async function updateShop(context: Ctx<UpdateShopBody, TParams>) {
  const { body, authPayload, params } = context;

  const shop = await shopsService.update(params.id, authPayload.userId, body);

  if (!shop) return res.fail("Failed to update shop.", { code: "FAIL" });

  return res.ok("Shop updated.", { shop });
}

export async function updateShopAddress(
  context: Ctx<UpdateAddressBody, TParams>,
) {
  const { body, params, authPayload } = context;

  const address = await shopsService.upsertShopAddress(
    params.id,
    authPayload.userId,
    body,
  );

  if (!address) return res.fail("Failed to update address.", { code: "FAIL" });

  return res.ok("Address updated.", { address });
}

export async function deleteShop(context: Ctx<unknown, TParams>) {
  const { params, authPayload } = context;

  const shop = await shopsService.remove(params.id, authPayload.userId);

  if (!shop) return res.fail("Failed to delete", { code: "FAIL" });

  return res.ok("Shop deleted.", { id: shop.id });
}

export async function getShops(context: Ctx) {
  const { authPayload } = context;

  const service = shopsService.query;

  const shops = await (authPayload.role === "admin"
    ? service()
    : service(authPayload.userId));

  return res.ok("Shops fetched.", { shops });
}

export async function getShopById(context: Ctx<unknown, TParams>) {
  const { authPayload, params } = context;

  const service = shopsService.queryById;

  const shop = await (authPayload.role === "admin"
    ? service(params.id)
    : service(params.id, authPayload.userId));

  if (!shop) return res.fail("Shop not found", { code: "NOT_FOUND" });

  return res.ok("Shop fetched.", { shop });
}
