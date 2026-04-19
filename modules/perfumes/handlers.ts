import * as perfumeService from "./service";
import type {
  ApprovedPerfumeBody,
  CreateAdminPerfumeBody,
  CreatePerfumeBody,
  PfParams,
  UpdatePerfumeBody,
} from "./schema";
import { response } from "../../utils/response";
import type { Ctx, CtxWithoutPayload } from "../../utils/globalSchema";

export async function createPerfume(context: Ctx<CreatePerfumeBody>) {
  const { body } = context;

  const perfume = await perfumeService.create(body.name);

  return response.ok("Perfume Created", {
    id: perfume.id,
    name: perfume.name,
  });
}

export async function createAdminPerfume(context: Ctx<CreateAdminPerfumeBody>) {
  const { body } = context;

  const perfume = await perfumeService.adminCreate(body);

  return response.ok("Approved Perfume Created", {
    id: perfume.id,
    name: perfume.name,
  });
}

export async function approvePerfume(
  context: Ctx<ApprovedPerfumeBody, PfParams>,
) {
  const { body, params } = context;

  const perfume = await perfumeService.adminApprove(params.perfumeId, body);

  return response.ok("Perfume Approved", {
    id: perfume.id,
    name: perfume.name,
  });
}

export async function getPublicPerfumes(context: CtxWithoutPayload) {
  const { query } = context;

  const perfumes = await perfumeService.dashboardQuery(query);

  return response.ok("Perfumes fetched", perfumes);
}

export async function getDashboardPerfumes(context: Ctx) {
  const { query } = context;

  const perfumes = await perfumeService.publicQuery(query);

  return response.ok("Perfumes fetched", perfumes);
}

export async function updatePerfume(context: Ctx<UpdatePerfumeBody, PfParams>) {
  const { body, params } = context;

  const perfume = await perfumeService.update(params.perfumeId, body);

  return response.ok("Perfume updated", {
    id: perfume.id,
    name: perfume.name,
  });
}

export async function deletePerfume(context: Ctx<unknown, PfParams>) {
  const { params } = context;

  const perfume = await perfumeService.remove(params.perfumeId);

  return response.ok("Perfume deleted", { name: perfume.name });
}
