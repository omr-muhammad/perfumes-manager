import { backend } from "../../api/client";
import type { CoQuery, CoUpdates, NewCompany } from "./types";

export async function apiCoQuery(query?: CoQuery) {
  const { data, error } = await backend.api.companies.get({
    query: query || ({} as CoQuery),
  });

  if (error || !data?.success)
    throw new Error(data?.message || error?.value.message);

  return data.data!;
}

export async function apiGetCoById(companyId: number) {
  const { data, error } = await backend.api.companies({ companyId }).get();

  if (error || !data.success)
    throw new Error(error?.value.message || data!.message);

  return data.data!;
}

export async function apiCoCreate(newCo: NewCompany) {
  const { data, error } = await backend.api.companies.post(newCo);

  if (error || !data.success)
    throw new Error(error?.value.message || data!.message);

  return data.data!;
}

export async function apiCoUpdate(companyId: number, updates: CoUpdates) {
  const { data, error } = await backend.api.admin
    .companies({ companyId })
    .patch(updates);

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message || "ERR_UNKNOWN");

  return data.data!;
}

export async function apiCoApprove(companyId: number, updates: CoUpdates) {
  const { data, error } = await backend.api.admin
    .companies({ companyId })
    .approve.patch(updates);

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message || "ERR_UNKNOWN");

  return data.data!;
}

export async function apiCoDelete(companyId: number) {
  const { data, error } = await backend.api.admin
    .companies({ companyId })
    .delete();

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message || "ERR_UNKNOWN");

  return data.data!;
}
