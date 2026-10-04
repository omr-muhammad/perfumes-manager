import type { Treaty } from "@elysia/eden";
import type { backend } from "../../api/client";

export type CompoundsOptions = NonNullable<
  Parameters<typeof backend.api.compounds.get>[0]
>;
export type CompoundsQuery = NonNullable<CompoundsOptions["query"]>;

export type CompoundsGetResponse = NonNullable<
  Treaty.Data<typeof backend.api.compounds.get>["data"]
>["compounds"]["data"];
export type CompoundItem = CompoundsGetResponse[number];

type UnpairedCompoundsOptions = NonNullable<
  Parameters<typeof backend.api.compounds.unpaired.get>[0]
>;
export type UnpairedCompoundsQuery = NonNullable<
  UnpairedCompoundsOptions["query"]
>;

type UnpairedResponse = NonNullable<
  Treaty.Data<typeof backend.api.compounds.unpaired.get>["data"]
>["unpairedCompounds"];
export type UnpairedItem = UnpairedResponse[number];
// -------------------- Create Types --------------------
export type NewCompound = Parameters<typeof backend.api.compounds.post>[0];

// -------------------- Update Types --------------------
export type UpdateCompound = Parameters<
  ReturnType<typeof backend.api.admin.compounds>["patch"]
>[0];
