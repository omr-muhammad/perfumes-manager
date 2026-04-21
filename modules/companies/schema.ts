import { createInsertSchema } from "drizzle-typebox";
import { t, type Static } from "elysia";
import { companiesTable } from "../../db/schema";
import { ID, QueriesMeta, type Ctx } from "../../utils/globalSchema";

const CoClass = t.Union([t.Literal("global"), t.Literal("custom")], {
  error: "Compnay type is either (global) or (custom)",
});

const insertSchema = createInsertSchema(companiesTable, {
  country: t.String({
    error: "Country name is required",
  }),
  type: CoClass,
});

// ------------ Create ------------
export const CreateCompanyBody = t.Omit(insertSchema, [
  "createdAt",
  "updatedAt",
  "approved",
]);
export type CreateCompanyBody = Static<typeof CreateCompanyBody>;

// ------------ Udate ------------
export const UpdateCompanyBody = t.Partial(CreateCompanyBody);
export type UpdateCompanyBody = Static<typeof UpdateCompanyBody>;

// ------------ Query ------------
export const CompaniesQueryFilters = t.Object({
  search: t.Optional(t.String()),
  country: t.Optional(t.String()),
  type: t.Optional(CoClass),
  approved: t.Optional(t.BooleanString({ default: true })),
  ...QueriesMeta,
});
export type CompaniesQueryFilters = Static<typeof CompaniesQueryFilters>;

// ------------ Handlers ------------
const CParams = t.Object({ compnayId: ID });
type CParams = Static<typeof CParams>;

// ------------ Contexts Types ------------
export type CreateCoCtx = Ctx<CreateCompanyBody>;
export type ApproveCoCtx = Ctx<UpdateCompanyBody, CParams>;
export type QueryCoCtx = Ctx<unknown, unknown, CompaniesQueryFilters>;
export type UpdateCoCtx = Ctx<UpdateCompanyBody, CParams>;
export type DelCoCtx = Ctx<unknown, CParams>;

// ------------ Contexts Validators ------------
export const CreateCoValidators = { body: CreateCompanyBody };
export const ApproveCoValidators = { params: CParams, body: UpdateCompanyBody };
export const UpdateCoValidators = { params: CParams, body: UpdateCompanyBody };
export const DelCoValidators = { params: CParams };
export const QueryCoValidators = { query: CompaniesQueryFilters };
