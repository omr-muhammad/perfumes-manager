import type { Treaty } from "@elysia/eden";
import { backend } from "./client";

type CoResponse = Treaty.Data<typeof backend.api.companies.get>;
export type Company = NonNullable<CoResponse["data"]>["data"][number];
export type CoOptions = NonNullable<
  Parameters<typeof backend.api.companies.get>[0]
>;
export type CoQuery = NonNullable<CoOptions["query"]>;

export async function apiCoQuery(query?: CoQuery) {
  const { data, error } = await backend.api.companies.get({
    query: query || ({} as CoQuery),
  });

  if (error || !data?.success)
    throw new Error(data?.message || error?.value.message);

  return data.data!;
}
