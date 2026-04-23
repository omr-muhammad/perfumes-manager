import { response as res } from "../../../utils/response";
import type { AlcoCTXs } from "./schema";
import * as alcoService from "./service";

export async function createAlco(context: AlcoCTXs["createAlco"]) {
  const { body, params, authPayload } = context;

  const alcohol = await alcoService.create(
    authPayload.userId,
    params.shopId,
    body,
  );

  return res.ok("Alcohol added to inventory.", { alcohol });
}

export async function updateAlco(context: AlcoCTXs["updateAlco"]) {
  const { body, params, authPayload } = context;

  const alcohol = await alcoService.update(
    authPayload.userId,
    params.shopId,
    params.alcoholId,
    body,
  );

  return res.ok("Alcohol Inventory Updates.", { alcohol });
}

export async function deleteAlco(context: AlcoCTXs["delAlco"]) {
  const { authPayload, params } = context;

  const alcohol = await alcoService.remove(
    authPayload.userId,
    params.shopId,
    params.alcoholId,
  );

  return res.ok("Alcohol inventory deleted.", { id: alcohol.id });
}

export async function getAllAlcoInv(context: AlcoCTXs["queryAll"]) {
  const { authPayload, params, query } = context;

  const alcohols = await alcoService.queryAll(
    authPayload.userId,
    params.shopId,
    query,
  );

  return res.ok("Alcohols fetched.", {
    alcohols: alcohols.map(({ alcohols, shops }) => ({
      ...alcohols,
      shopName: shops.name,
      ...(shops.logo && { shopLogo: shops.logo }),
    })),
  });
}

export async function getAlcoById(context: AlcoCTXs["queryOne"]) {
  const { params, authPayload } = context;

  const alcohol = await alcoService.queryById(
    authPayload.userId,
    params.shopId,
    params.alcoholId,
  );

  const {
    alcohols,
    shops: { name, logo, ...others },
  } = alcohol;
  return res.ok("Alcohol fetched.", {
    alcohol: { ...alcohols, shopName: name, ...(logo && { shopLogo: logo }) },
  });
}
