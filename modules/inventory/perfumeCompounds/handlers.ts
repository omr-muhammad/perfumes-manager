import type { Ctx, ShopParams } from "../../../utils/globalSchema";
import { response as res } from "../../../utils/response";
import type {
  CompParams,
  CreateCompoundBody,
  UpdateCompoundBody,
} from "./schema";
import * as compService from "./service";

export async function createComp(context: Ctx<CreateCompoundBody, ShopParams>) {
  const { authPayload, params, body } = context;

  const compound = await compService.create(
    authPayload.userId,
    params.shopId,
    body,
  );

  if (!compound)
    return res.fail("Failed to create new compound", { code: "FAILED" });

  return res.ok("Compound create.", { compound });
}

export async function updateComp(context: Ctx<UpdateCompoundBody, CompParams>) {
  const { body, params, authPayload } = context;

  const compound = await compService.update(
    authPayload.userId,
    params.shopId,
    params.compId,
    body,
  );

  if (!compound) return res.fail("Faied to update.", { code: "FAILED" });

  return res.ok("Perfume Compound updated.", { compound });
}

export async function deleteComp(context: Ctx<unknown, CompParams>) {
  const { authPayload, params } = context;

  const compound = await compService.remove(
    authPayload.userId,
    params.shopId,
    params.compId,
  );

  if (!compound)
    return res.fail("Failed to delete, compound may not exist.", {
      code: "NOT_FOUND",
    });

  return res.ok("Perfume Compound deleted.", { id: compound.id });
}

export async function getShopCompounds(context: Ctx<unknown, ShopParams>) {
  const { params, authPayload } = context;

  const compounds = await compService.queryAll(
    authPayload.userId,
    params.shopId,
  );

  return res.ok("Perfumes Compounds fetched.", { compounds });
}

export async function getBtlById(context: Ctx<unknown, CompParams>) {
  const { authPayload, params } = context;

  const compound = await compService.queryById(
    authPayload.userId,
    params.shopId,
    params.compId,
  );

  if (!compound)
    return res.fail(`Compound with id ${params.compId} does not exist.`, {
      code: "NOT_FOUND",
    });

  return res.ok("Compound fetched.", { compound });
}
