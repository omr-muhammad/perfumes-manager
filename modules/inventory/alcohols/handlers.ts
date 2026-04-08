import type { Ctx, TParams } from "../../../utils/globalSchema";
import { response as res } from "../../../utils/response";
import type { CreateAlcoBody } from "./schema";
import * as alcoSv from "./service";

export async function createAlco(context: Ctx<CreateAlcoBody, TParams>) {
  const { body, params, authPayload } = context;

  const alcohol = await alcoSv.create(authPayload.userId, params.shopId, body);

  return res.ok("Alcohol added to inventory.", { alcohol });
}
