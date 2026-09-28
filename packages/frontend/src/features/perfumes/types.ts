import type { Treaty } from "@elysia/eden";
import type { backend } from "../../api/client";

// -------------------------------------- QUERY --------------------------------------
export type PerfumeOptions = NonNullable<
  Parameters<typeof backend.api.perfumes.get>[0]
>;
export type PerfumeQuery = NonNullable<PerfumeOptions["query"]>;
type PerfumeResponse = Treaty.Data<typeof backend.api.perfumes.get>;
export type Perfume = NonNullable<PerfumeResponse["data"]>["data"][number];
export type Season = NonNullable<Perfume["seasons"]>[number];
export type PerfumeSex = NonNullable<Perfume["sex"]>;

// -------------------------------------- CREATE --------------------------------------
export type NewPerfume = Parameters<typeof backend.api.perfumes.post>[0];

// -------------------------------------- UPDATE --------------------------------------
export type PerfumeUpdates = Parameters<
  ReturnType<typeof backend.api.admin.perfumes>["patch"]
>[0];

// -------------------------------------- LOCALS --------------------------------------
export type FormPerfume = Omit<
  Perfume,
  "createdAt" | "updatedAt" | "approved" | "id"
>;
