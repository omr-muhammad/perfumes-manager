import type { Ctx, ShopParams } from "../../../utils/globalSchema";
import { response as res } from "../../../utils/response";
import type { CreateCompoundBody } from "./schema";
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
