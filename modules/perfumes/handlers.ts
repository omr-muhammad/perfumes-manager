import * as perfumeService from "./service";
import { type PerfumesCTXs as CTXs } from "./schema";
import { response } from "../../utils/response";

export async function createPerfume(context: CTXs["CreatePfCtx"]) {
  const { body, authPayload } = context;

  const approved = authPayload.role === "admin";
  const perfume = await perfumeService.create(body, approved);

  return response.ok("Perfume Created", {
    id: perfume.id,
    name: perfume.name,
  });
}

export async function approvePerfume(context: CTXs["UpdatePfCtx"]) {
  const { body, params } = context;

  const perfume = await perfumeService.adminApprove(params.perfumeId, body);

  return response.ok("Perfume Approved", {
    id: perfume.id,
    name: perfume.name,
  });
}

export async function getPerfumes(context: CTXs["QueryPfCtx"]) {
  const { query } = context;

  const perfumes = await perfumeService.query(query);

  return response.ok("Perfumes fetched", perfumes);
}

export async function updatePerfume(context: CTXs["UpdatePfCtx"]) {
  const { body, params } = context;

  const perfume = await perfumeService.update(params.perfumeId, body);

  return response.ok("Perfume updated", {
    id: perfume.id,
    name: perfume.name,
  });
}

export async function deletePerfume(context: CTXs["DelPfCtx"]) {
  const { params } = context;

  const perfume = await perfumeService.remove(params.perfumeId);

  return response.ok("Perfume deleted", { name: perfume.name });
}
