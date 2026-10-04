import { backend } from "@/api/client";
import type { NewPerfume, PerfumeQuery, PerfumeUpdates } from "./types";

export async function apiPerfumesQuery(query?: PerfumeQuery) {
  const { data, error } = await backend.api.perfumes.get({
    query,
  });

  if (error) throw new Error(error.value.message);

  return data.data;
}

export async function apiGetPerfumeById(perfumeId: number) {
  const { data, error } = await backend.api.perfumes({ perfumeId }).get();

  if (error || !data.success)
    throw new Error(error?.value.message ?? data!.message);

  return data.data!;
}

export async function apiAddPerfume(newPerfume: NewPerfume) {
  const { data, error } = await backend.api.perfumes.post(newPerfume);

  if (error || !data.success)
    throw new Error(error?.value.message ?? data!.message);

  return data.data!;
}

export async function apiEditPerfume(
  perfumeId: number | string,
  updates: PerfumeUpdates,
) {
  const { data, error } = await backend.api.admin
    .perfumes({ perfumeId })
    .patch(updates);

  if (error || !data || !data.success)
    throw new Error(
      error?.value.message ?? data?.message ?? "Failed to update.",
    );

  return data.data!;
}

export async function apiApprovePerfume(
  perfumeId: number,
  dataToApprove: PerfumeUpdates,
) {
  const { data, error } = await backend.api.admin
    .perfumes({ perfumeId })
    .approve.patch(dataToApprove);

  if (error || !data?.success)
    throw new Error(
      error?.value.message ?? data?.message ?? "Failed to approve.",
    );

  return data.data!;
}

export async function apiDeletePerfume(perfumeId: number) {
  const { data, error } = await backend.api.admin
    .perfumes({ perfumeId })
    .delete();

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message);

  return data.data!;
}
