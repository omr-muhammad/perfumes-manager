import { backend } from "./client";
import type { Treaty } from "@elysia/eden";

export type PerfumeOptions = NonNullable<
  Parameters<typeof backend.api.perfumes.get>[0]
>;
export type PerfumeQuery = NonNullable<PerfumeOptions["query"]>;
type PerfumeResponse = Treaty.Data<typeof backend.api.perfumes.get>;
export type Perfume = NonNullable<PerfumeResponse["data"]>["data"][number];
export type Season = NonNullable<Perfume["seasons"]>[number];
export type PerfumeSex = NonNullable<Perfume["sex"]>;
export type NewPerfume = Parameters<typeof backend.api.perfumes.post>[0];
export type PerfumeUpdates = Parameters<
  ReturnType<typeof backend.api.admin.perfumes>["patch"]
>[0];

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
