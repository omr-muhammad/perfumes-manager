import { createInsertSchema } from "drizzle-typebox";
import { t, type Static } from "elysia";
import { companiesTable } from "../../db/schema";
import { ID } from "../../utils/globalSchema";

export const CParams = t.Object({ compnayId: ID });
export type CParams = Static<typeof CParams>;

const insertSchema = createInsertSchema(companiesTable, {
  country: t.String(),
  type: t.Union([t.Literal("global"), t.Literal("custom")]),
});

export const CreateCompanyBody = t.Omit(insertSchema, [
  "createdAt",
  "updatedAt",
  "approved",
]);
export type CreateCompanyBody = Static<typeof CreateCompanyBody>;

export const ApproveCompnayBody = t.Object({
  name: t.Optional(t.String()),
  country: t.String(),
  logo: t.Optional(t.String()),
});
export type ApproveCompnayBody = Static<typeof ApproveCompnayBody>;

export const UpdateCompanyBody = t.Partial(CreateCompanyBody);
export type UpdateCompanyBody = Static<typeof UpdateCompanyBody>;

// ------------ Query ------------
export const CompaniesQueryFilters = t.Object({
  name: t.Optional(t.String()),
  country: t.Optional(t.String()),
  type: t.Optional(t.Union([t.Literal("global"), t.Literal("custom")])),
  approved: t.Optional(t.BooleanString({ default: true })),
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
});
export type CompaniesQueryFilters = Static<typeof CompaniesQueryFilters>;
