import type { Ctx, TParams, TStaffParams } from "../../utils/globalSchema";
import { response as res } from "../../utils/response";
import type {
  CreateShopBody,
  StaffBody,
  UpdateAddressBody,
  UpdateShopBody,
  UpdateStaffBody,
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

export async function addShopStaff(context: Ctx<StaffBody, TParams>) {
  const { params, body, authPayload } = context;

  const staff = await shopsService.addStaff(
    authPayload.userId,
    params.id,
    body,
  );

  return res.ok("Staff added.", {
    shopName: staff.shop.name,
    staffEmail: staff.user.email,
    staffName: staff.user.name,
    shopRole: staff.staffRole,
    appRole: staff.user.role,
  });
}

export async function removeShopStaff(context: Ctx<unknown, TStaffParams>) {
  const { params, authPayload } = context;

  const staff = await shopsService.removeStaff(
    authPayload.userId,
    params.id,
    params.staffId,
  );

  if (!staff)
    return res.fail("Failed to delete, may user not belong to this shop", {
      code: "FAILED",
    });

  return res.ok("Staff deleted.", {
    staffId: staff.userId,
    shopRole: staff.role,
  });
}

export async function getShopStaff(context: Ctx<unknown, TParams>) {
  const { params, authPayload } = context;

  const staff = await shopsService.getShopStaff(authPayload.userId, params.id);

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

export async function updateShopStaff(
  context: Ctx<UpdateStaffBody, TStaffParams>,
) {
  const { params, authPayload, body } = context;

  const staff = await shopsService.updateShopStaff(
    authPayload.userId,
    params.id,
    params.staffId,
    body,
  );

  if (!staff) return res.fail("Failed to update staff", { code: "FAILED" });

  return res.ok("Staff updated.", {
    staffId: staff.userId,
    shopId: staff.shopId,
    shopRole: staff.role,
  });
}
