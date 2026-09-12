import type { Treaty } from "@elysia/eden";
import { backend } from "./client";

export type CompoundsOptions = NonNullable<
  Parameters<typeof backend.api.compounds.get>[0]
>;
export type CompoundsQuery = NonNullable<CompoundsOptions["query"]>;

export type CompoundsGetResponse = NonNullable<
  Treaty.Data<typeof backend.api.compounds.get>["data"]
>["compounds"]["data"];

// -------------------- Create Types --------------------
export type NewCompound = Parameters<typeof backend.api.compounds.post>[0];

// -------------------- Update Types --------------------
export type UpdateCompound = Parameters<
  ReturnType<typeof backend.api.admin.compounds>["patch"]
>[0];

export async function apiGetCompounds(query: CompoundsQuery) {
  const { data, error } = await backend.api.compounds.get({ query });

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message);

  return data.data!.compounds;
}

export async function apiGetCompoundById(compoundId: number) {
  const { data, error } = await backend.api.compounds({ compoundId }).get();

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message);

  return data.data!.perfumeComp;
}

export async function apiCreateCompound(newComp: NewCompound) {
  const { data, error } = await backend.api.compounds.post(newComp);

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message);

  return data.data!.perfumeComp;
}

export async function apiUpdateCompound(
  compoundId: number,
  updates: UpdateCompound,
) {
  const { data, error } = await backend.api.admin
    .compounds({ compoundId })
    .patch(updates);

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message);

  return data.data!.perfumeComp;
}

export async function apiDeleteCompound(compoundId: number) {
  const { data, error } = await backend.api.admin
    .compounds({ compoundId })
    .delete();

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message);

  return data.data!.perfumeCompId;
}
