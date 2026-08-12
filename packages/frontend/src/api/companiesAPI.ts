import type { Treaty } from "@elysia/eden";
import { backend } from "./client";

// ---------- Companies Query ----------
type CoResponse = Treaty.Data<typeof backend.api.companies.get>;
export type Company = NonNullable<CoResponse["data"]>["data"][number];
export type CoOptions = NonNullable<
  Parameters<typeof backend.api.companies.get>[0]
>;
export type CoQuery = NonNullable<CoOptions["query"]>;
// -------------------------------------

// ---------- Comapnies Create ----------
export type NewCompany = Parameters<typeof backend.api.companies.post>[0];
// --------------------------------------

// ---------- Comapnies Update ----------
export type CoUpdates = Parameters<
  ReturnType<typeof backend.api.admin.companies>["patch"]
>[0];
// --------------------------------------

export async function apiCoQuery(query?: CoQuery) {
  const { data, error } = await backend.api.companies.get({
    query: query || ({} as CoQuery),
  });

  if (error || !data?.success)
    throw new Error(data?.message || error?.value.message);

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

export async function apiCoDelete(companyId: number) {
  const { data, error } = await backend.api.admin
    .companies({ companyId })
    .delete();

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message || "ERR_UNKNOWN");

  return data.data!;
}
