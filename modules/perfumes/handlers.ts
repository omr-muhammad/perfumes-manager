import * as perfumeService from "./service";
import type {
  ApprovedPerfumeBody,
  CreateAdminPerfumeBody,
  CreatePerfumeBody,
  UpdatePerfumeBody,
} from "./schema";

export async function createPerfume(context: { body: CreatePerfumeBody }) {
  const { body } = context;

  const perfume = await perfumeService.create(body.name);

  return perfume;
}

export async function createAdminPerfume(context: {
  body: CreateAdminPerfumeBody;
}) {
  const { body } = context;

  const perfume = await perfumeService.adminCreate(body);

  return perfume;
}

export async function approvePerfume(context: {
  params: { id: number };
  body: ApprovedPerfumeBody;
}) {
  const { body, params } = context;

  const updatedPerfume = await perfumeService.adminApprove(params.id, body);

  return updatedPerfume;
}

export async function getPerfumesDashboard() {
  const perfumes = await perfumeService.queryAll("dashboard");

  return perfumes;
}

export async function getPerfumesPublic() {
  const perfumes = await perfumeService.queryAll();

  return perfumes;
}

export async function updatePerfume(context: {
  params: { id: number };
  body: UpdatePerfumeBody;
}) {
  const { body, params } = context;

  const perfume = await perfumeService.update(params.id, body);

  return perfume;
}

export async function deletePerfume(context: { params: { id: number } }) {
  const { params } = context;

  const perfume = await perfumeService.remove(params.id);

  return { message: "Deleted successfully." };
}
