import { response as res } from "../../utils/response";
import { type ShopsCTXs, type ShopStaffCTXs } from "./schema";
import * as shopsService from "./service";

// ----------------- Admin & Owner -----------------
export async function createNewShop(context: ShopsCTXs["CreateShop"]) {
  const { body } = context;

  const shop = await shopsService.create(body.ownerId!, body, body.address);

  if (body.address && !("address" in shop!))
    return res.ok("Shop created successfully but failed to add address", {
      shop,
    });

  return res.ok("Shop created", { shop });
}

export async function getShops(context: ShopsCTXs["QueryShops"]) {
  const { authPayload, query } = context;

  const service = shopsService.query;

  const shops = await (authPayload.role === "admin"
    ? service(query)
    : service(query, authPayload.userId));

  return res.ok("Shops fetched.", { shops });
}

export async function getShopById(context: ShopsCTXs["QueryShopById"]) {
  const { authPayload, params } = context;

  const service = shopsService.queryById;

  const shop = await (authPayload.role === "admin"
    ? service(params.shopId)
    : service(params.shopId, authPayload.userId));

  return res.ok("Shop fetched.", { shop });
}

export async function deleteShopById(context: ShopsCTXs["DelShop"]) {
  const { params, authPayload } = context;

  const isAdmin = authPayload.role === "admin";
  const shop = await (isAdmin
    ? shopsService.remove(params.shopId)
    : shopsService.remove(params.shopId, authPayload.userId));

  return res.ok("Shop deleted.", { id: shop.id });
}

// ----------------- Admin -----------------
export async function handleShopActivation(context: ShopsCTXs["Activation"]) {
  const { params, body } = context;

  const shop = await shopsService.handleActivation(params.shopId, body.active);

  return res.ok("Shop updated.", { shop });
}

// ----------------- Owner -----------------
export async function updateMyShop(context: ShopsCTXs["UpdateShop"]) {
  const { body, authPayload, params } = context;

  const shop = await shopsService.update(
    params.shopId,
    authPayload.userId,
    body,
  );

  return res.ok("Shop updated.", { shop });
}

export async function upsertShopAddress(
  context: ShopsCTXs["UpsertShopAddress"],
) {
  const { body, params, authPayload } = context;

  const address = await shopsService.upsertShopAddress(
    authPayload.userId,
    params.shopId,
    body,
  );

  return res.ok("Address updated.", { address });
}

export async function hideShop(context: ShopsCTXs["HideShop"]) {
  const { body, params, authPayload } = context;

  const shop = await shopsService.hide(
    authPayload.userId,
    params.shopId,
    body.hidden,
  );

  const shouldBe = body.hidden ? "hidden" : "shown";

  return res.ok(`Shop ${shouldBe} success`, { shop });
}

// ----------------------- STAFF -----------------------
export async function createShopStaff(context: ShopStaffCTXs["CreateStaff"]) {
  const { params, body, authPayload } = context;

  const result = await shopsService.addStaff(
    authPayload.userId,
    params.shopId,
    body,
  );

  return res.ok("Staff added.", {
    shopName: result.shop.name,
    staffEmail: result.user.email,
    staffName: result.user.name,
    shopRole: result.staffRole,
    appRole: result.user.role,
  });
}

export async function removeShopStaff(context: ShopStaffCTXs["RmStaff"]) {
  const { params, authPayload } = context;

  const staff = await shopsService.removeStaff(
    authPayload.userId,
    params.shopId,
    params.staffId,
  );

  return res.ok("Staff removed.", {
    id: staff.id,
    role: staff.role,
  });
}

export async function getShopStaff(context: ShopStaffCTXs["QueryShopStaff"]) {
  const { params, authPayload } = context;

  const staff = await shopsService.getShopStaff(
    authPayload.userId,
    params.shopId,
  );

  return res.ok("Staff fetched.", {
    staff: staff.map((s) => ({
      id: s.users.id,
      name: s.users.name,
      email: s.users.email,
      appRole: s.users.role,
      shopRole: s.shop_staff.role,
    })),
  });
}

export async function updateShopStaff(context: ShopStaffCTXs["UpdateStaff"]) {
  const { params, authPayload, body } = context;

  const staff = await shopsService.updateShopStaff(
    authPayload.userId,
    params.shopId,
    params.staffId,
    body,
  );

  return res.ok("Staff updated.", {
    staffId: staff.userId,
    shopId: staff.shopId,
    shopRole: staff.role,
  });
}
