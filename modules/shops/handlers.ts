import type { Ctx } from "../../utils/globalSchema";
import { response as res } from "../../utils/response";
import type { CreateNewShopBody } from "./schema";
import * as shopsService from "./service";

export async function createNewUser(context: Ctx<CreateNewShopBody>) {
  const { authPayload, body, status } = context;

  let ownerId: number;
  if (authPayload.role === "admin") {
    if (body.ownerId === undefined) return status(422);

    ownerId = body.ownerId;
  } else ownerId = authPayload.userId;

  const shop = await shopsService.create(ownerId, body);

  return res.ok("Shop created", { shop });
}
