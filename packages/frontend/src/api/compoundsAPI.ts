import type { Treaty } from "@elysia/eden";
import { backend } from "./client";

export type CompoundsOptions = NonNullable<
  Parameters<typeof backend.api.compounds.get>[0]
>;
export type CompoundsQuery = NonNullable<CompoundsOptions["query"]>;

export type CompoundsGetResponse = NonNullable<
  Treaty.Data<typeof backend.api.compounds.get>["data"]
>["compounds"]["data"];

export async function apiGetCompounds(query: CompoundsQuery) {
  const { data, error } = await backend.api.compounds.get({ query });

  console.log("Api Error: ", error?.value ?? "no value");
  console.log("API Data: ", data);

  if (error || !data.success)
    throw new Error(error?.value.message || data?.message);

  return data.data!.compounds;
}
