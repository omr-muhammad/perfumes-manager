import * as perfumeService from "./service";
import type {
  ApprovedPerfumeBody,
  CreateAdminPerfumeBody,
  CreatePerfumeBody,
  UpdatePerfumeBody,
} from "./schema";
import { response } from "../../utils/response";

export async function createPerfume(context: { body: CreatePerfumeBody }) {
  const { body } = context;

  const perfume = await perfumeService.create(body.name);

  return response.ok("Perfume Created", {
    id: perfume?.id,
    name: perfume?.name,
  });
}

export async function createAdminPerfume(context: {
  body: CreateAdminPerfumeBody;
}) {
  const { body } = context;

  const perfume = await perfumeService.adminCreate(body);

  return response.ok("Approved Perfume Created", {
    id: perfume?.id,
    name: perfume?.name,
  });
}

export async function approvePerfume(context: {
  params: { id: number };
  body: ApprovedPerfumeBody;
}) {
  const { body, params } = context;

  const perfume = await perfumeService.adminApprove(params.id, body);

  return response.ok("Perfume Approved", {
    id: perfume?.id,
    name: perfume?.name,
  });
}

export async function getPerfumesDashboard() {
  const perfumes = await perfumeService.queryAll("dashboard");

  return response.ok("Perfumes fetched", perfumes);
}

export async function getPerfumesPublic() {
  const perfumes = await perfumeService.queryAll();

  return response.ok("Perfumes fetched", perfumes);
}

export async function updatePerfume(context: {
  params: { id: number };
  body: UpdatePerfumeBody;
}) {
  const { body, params } = context;

  const perfume = await perfumeService.update(params.id, body);

  return response.ok("Perfume updated", {
    id: perfume?.id,
    name: perfume?.name,
  });
}

export async function deletePerfume(context: { params: { id: number } }) {
  const { params } = context;

  const perfume = await perfumeService.remove(params.id);

  return response.ok("Perfume deleted", { name: perfume?.name });
}
