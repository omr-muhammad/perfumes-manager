import type { Treaty } from "@elysia/eden";
import type { backend } from "../../api/client";

// ------------------------------ QUERY ------------------------------
type CoResponse = Treaty.Data<typeof backend.api.companies.get>;
export type Company = NonNullable<CoResponse["data"]>["data"][number];
export type CoOptions = NonNullable<
  Parameters<typeof backend.api.companies.get>[0]
>;
export type CoQuery = NonNullable<CoOptions["query"]>;

// ------------------------------ CREATE ------------------------------
export type NewCompany = Parameters<typeof backend.api.companies.post>[0];

// ------------------------------ UPDATE ------------------------------
export type CoUpdates = Parameters<
  ReturnType<typeof backend.api.admin.companies>["patch"]
>[0];

// ------------------------------ GENERALS ------------------------------
export type EditApproveCo = { coId: number; updates: CoUpdates };

export type FormCompany = Omit<
  Company,
  "createdAt" | "updatedAt" | "id" | "approved"
>;
