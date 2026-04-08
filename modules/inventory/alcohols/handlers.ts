import type { Ctx, TAlcoParams, TParams } from "../../../utils/globalSchema";
import { response as res } from "../../../utils/response";
import type { CreateAlcoBody, UpdateAlcoBody } from "./schema";
import * as alcoService from "./service";

export async function createAlco(context: Ctx<CreateAlcoBody, TParams>) {
  const { body, params, authPayload } = context;

  const alcohol = await alcoService.create(
    authPayload.userId,
    params.shopId,
    body,
  );

  return res.ok("Alcohol added to inventory.", { alcohol });
}

export async function updateAlco(context: Ctx<UpdateAlcoBody, TAlcoParams>) {
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
