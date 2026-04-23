import { response as res } from "../../../utils/response";
import type { CompCTXs } from "./schema";
import * as compService from "./service";

export async function createComp(context: CompCTXs["create"]) {
  const { authPayload, params, body } = context;

  const compound = await compService.create(
    authPayload.userId,
    params.shopId,
    body,
  );

  if (body.aging && !compound.aging)
    return res.ok("Compound created but failed to add aging.", { compound });

  return res.ok("Compound create.", { compound });
}

export async function updateComp(context: CompCTXs["update"]) {
  const { body, params, authPayload } = context;

  const compound = await compService.update(
    authPayload.userId,
    params.shopId,
    params.compId,
    body,
  );

  return res.ok("Perfume Compound updated.", { compound });
}

export async function deleteComp(context: CompCTXs["del"]) {
  const { authPayload, params } = context;

  const compound = await compService.remove(
    authPayload.userId,
    params.shopId,
    params.compId,
  );

  return res.ok("Perfume Compound deleted.", { id: compound.id });
}

export async function getShopCompounds(context: CompCTXs["queryAll"]) {
  const { params, authPayload, query } = context;

  const compounds = await compService.queryAll(
    authPayload.userId,
    params.shopId,
    query,
  );

  return res.ok("Perfumes Compounds fetched.", { compounds });
}

export async function getBtlById(context: CompCTXs["queryOne"]) {
  const { authPayload, params } = context;

  const compound = await compService.queryById(
    authPayload.userId,
    params.shopId,
    params.compId,
  );

  return res.ok("Compound fetched.", { compound });
}

// AGING
export async function addAgingToComp(context: CompCTXs["addAging"]) {
  const { params, body, authPayload } = context;

  const aging = await compService.addAging(
    authPayload.userId,
    params.shopId,
    params.compId,
    body,
  );

  return res.ok("Aging Added to perfume compound.", { aging });
}

export async function updateCompAging(context: CompCTXs["updateAging"]) {
  const { authPayload, body, params } = context;

  const aging = await compService.updateAging(
    authPayload.userId,
    params.shopId,
    params.compId,
    params.agingId,
    body,
  );

  return res.ok("Perfume Compound Aging updated.", { aging });
}

export async function deleteCompAging(context: CompCTXs["delAging"]) {
  const { params, authPayload, body } = context;

  const aging = await compService.deleteAging(
    authPayload.userId,
    params.shopId,
    params.compId,
    params.agingId,
    body.retrieveAcohol,
  );

  return res.ok("Aging deleted.", { id: aging.id, compoundId: params.compId });
}

export async function getCompAgings(context: CompCTXs["queryCompAgings"]) {
  const { authPayload, params } = context;

  const compAgings = await compService.queryCompAgings(
    authPayload.userId,
    params.shopId,
    params.compId,
  );

  return res.ok("Perfume Compound Agings fetched.", { agings: compAgings });
}

export async function getCompAgingById(context: CompCTXs["queryOneAging"]) {
  const { authPayload, params } = context;

  const compAging = await compService.queryCompAgingById(
    authPayload.userId,
    params.shopId,
    params.agingId,
  );

  return res.ok("Perfume Compound Agings fetched.", { agings: compAging });
}
