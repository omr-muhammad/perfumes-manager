import { backend } from "../../api/client";
import type {
  CompoundsQuery,
  NewCompound,
  UnpairedCompoundsQuery,
  UpdateCompound,
} from "./types";

export async function apiGetCompounds(query: CompoundsQuery) {
  const { data, error } = await backend.api.compounds.get({ query });

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message);

  return data.data!.compounds;
}

export async function apiGetUnpairedCompounds(query: UnpairedCompoundsQuery) {
  const { data, error } = await backend.api.compounds.unpaired.get({ query });

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message);

  return data.data!.unpairedCompounds;
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
