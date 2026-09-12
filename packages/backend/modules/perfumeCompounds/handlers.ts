import { response as res } from "../../utils/response";
import type { PfCompCtxs, QueryPfComp } from "./schema";
import * as pfCompService from "./service";
import type { CompoundsByCompany, CompoundsByPerfume } from "./service";

export async function createPfComp(ctx: PfCompCtxs["create"]) {
  const pfComp = await pfCompService.create(ctx.body);

  return res.ok("Perfume Compound created.", { perfumeComp: pfComp });
}

export async function updatePfComp(ctx: PfCompCtxs["update"]) {
  const pfComp = await pfCompService.update(ctx.params, ctx.body);

  return res.ok("Perfume Compound updated.", { perfumeComp: pfComp });
}

export async function deletePfComp(ctx: PfCompCtxs["delete"]) {
  const pfComp = await pfCompService.remove(ctx.params);

  return res.ok("Perfume Compound deleted.", { perfumeCompId: pfComp.id });
}

export async function queryCompounds(ctx: PfCompCtxs["query"]) {
  const compounds = await pfCompService.getCompounds(ctx.query);

  return res.ok("Fetched Success.", { compounds });
}
