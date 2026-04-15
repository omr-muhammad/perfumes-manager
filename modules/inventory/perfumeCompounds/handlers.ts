import { aging } from "../../../db/schema/aging";
import type { Ctx, ShopParams } from "../../../utils/globalSchema";
import { response as res } from "../../../utils/response";
import type {
  AgingParams,
  CompParams,
  CreateAgingBody,
  CreateCompBody,
  RemoveAgingBody,
  UpdateAgingBody,
  UpdateCompoundBody,
} from "./schema";
import * as compService from "./service";

export async function createComp(context: Ctx<CreateCompBody, ShopParams>) {
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

// AGING
export async function addAgingToComp(
  context: Ctx<CreateAgingBody, CompParams>,
) {
  const { params, body, authPayload } = context;

  const aging = await compService.addAging(
    authPayload.userId,
    params.shopId,
    params.compId,
    body,
  );

  if (!aging)
    return res.fail(
      `Failed to add aging to prefume compound with id ${params.compId}`,
      { code: "FAILED" },
    );

  return res.ok("Aging Added to perfume compound.", { aging });
}

export async function updateCompAging(
  context: Ctx<UpdateAgingBody, AgingParams>,
) {
  const { authPayload, body, params } = context;

  const aging = await compService.updateAging(
    authPayload.userId,
    params.shopId,
    params.compId,
    params.agingId,
    body,
  );

  if (!aging)
    return res.fail("Failed to update current compound aging", {
      code: "FAILED",
    });

  return res.ok("Perfume Compound Aging updated.", { aging });
}

export async function deleteCompAging(
  context: Ctx<RemoveAgingBody, AgingParams>,
) {
  const { params, authPayload, body } = context;

  const aging = await compService.deleteAging(
    authPayload.userId,
    params.shopId,
    params.compId,
    params.agingId,
    body.retrieveAcohol,
  );

  if (!aging)
    return res.fail("Aging not found.", {
      code: "FAILED",
    });

  return res.ok("Aging deleted.", { id: aging.id, compoundId: params.compId });
}

export async function getCompAgings(context: Ctx<unknown, CompParams>) {
  const { authPayload, params } = context;

  const compAgings = await compService.queryCompAgings(
    authPayload.userId,
    params.shopId,
    params.compId,
  );

  return res.ok("Perfume Compound Agings fetched.", { agings: compAgings });
}

export async function getCompAgingById(context: Ctx<unknown, AgingParams>) {
  const { authPayload, params } = context;

  const compAging = await compService.queryCompAgingById(
    authPayload.userId,
    params.shopId,
    params.agingId,
  );

  if (!compAging)
    return res.fail(
      `Perfume Compound Aging with id: ${params.agingId} not found`,
      { code: "NOT_FOUND" },
    );

  return res.ok("Perfume Compound Agings fetched.", { agings: compAging });
}
