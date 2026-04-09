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
