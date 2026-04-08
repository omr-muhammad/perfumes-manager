import type { Ctx, ShopParams } from "../../../utils/globalSchema";
import { response as res } from "../../../utils/response";
import type { CreateBottleBody } from "./schema";
import * as btlService from "./service";

export async function createBtl(context: Ctx<CreateBottleBody, ShopParams>) {
  const { body, params, authPayload } = context;

  const bottle = await btlService.create(
    authPayload.userId,
    params.shopId,
    body,
  );

  if (!bottle) return res.fail("Failed to create bottle.", { code: "FAILED" });

  return res.ok("Bottle created.", { bottle });
}
