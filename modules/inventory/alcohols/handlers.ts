import type {
  Ctx,
  AlcoInvParams,
  ShopParams,
} from "../../../utils/globalSchema";
import { response as res } from "../../../utils/response";
import type { CreateAlcoBody, UpdateAlcoBody } from "./schema";
import * as alcoService from "./service";

export async function createAlco(context: Ctx<CreateAlcoBody, ShopParams>) {
  const { body, params, authPayload } = context;

  const alcohol = await alcoService.create(
    authPayload.userId,
    params.shopId,
    body,
  );

  return res.ok("Alcohol added to inventory.", { alcohol });
}

export async function updateAlco(context: Ctx<UpdateAlcoBody, AlcoInvParams>) {
  const { body, params, authPayload } = context;

  const alcohol = await alcoService.update(
    authPayload.userId,
    params.shopId,
    params.alcoholId,
    body,
  );

  if (!alcohol) return res.fail("Failed to update.", { code: "FAILED" });

  return res.ok("Alcohol Inventory Updates.", { alcohol });
}

export async function deleteAlco(context: Ctx<unknown, AlcoInvParams>) {
  const { authPayload, params } = context;

  const alcohol = await alcoService.remove(
    authPayload.userId,
    params.shopId,
    params.alcoholId,
  );

  if (!alcohol)
    return res.fail("Failed to delete, alcohol may not exist.", {
      code: "FAILED",
    });

  return res.ok("Alcohol inventory deleted.", { id: alcohol.id });
}

export async function getAllAlcoInv(context: Ctx<unknown, ShopParams>) {
  const { authPayload, params } = context;

  const alcohols = await alcoService.queryAll(
    authPayload.userId,
    params.shopId,
  );

  return res.ok("Alcohols fetched.", {
    alcohols: alcohols.map(({ alcohols, shops }) => ({
      ...alcohols,
      shopName: shops.name,
      ...(shops.logo && { shopLogo: shops.logo }),
    })),
  });
}

export async function getAlcoById(context: Ctx<unknown, AlcoInvParams>) {
  const { params, authPayload } = context;

  const alcohol = await alcoService.queryById(
    authPayload.userId,
    params.shopId,
    params.alcoholId,
  );

  if (!alcohol) return res.fail("alcohol not found.", { code: "NOT_FOUND" });

  const {
    alcohols,
    shops: { name, logo, ...others },
  } = alcohol;
  return res.ok("Alcohol fetched.", {
    alcohol: { ...alcohols, shopName: name, ...(logo && { shopLogo: logo }) },
  });
}
