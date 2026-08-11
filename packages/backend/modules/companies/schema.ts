import { createInsertSchema } from "drizzle-typebox";
import { t, type Static } from "elysia";
import { companiesTable } from "../../db/schema";
import { ID, QueriesMeta, type Ctx } from "../../utils/globalSchema";
import { enumToUnion } from "../../utils/unionToLiteral";
import { companyTypeEn } from "../../db/schema/enums";

const CoClass = enumToUnion(companyTypeEn);
const CompanyType = t.Union(CoClass, {
  error: `Company type must be one of (${companyTypeEn.enumValues.join(", ")})`,
});

const insertSchema = createInsertSchema(companiesTable, {
  hqCountryCode: t.String({
    error: "Country code is required",
  }),
  type: CompanyType,
});

// ------------ Create ------------
const CreateCompanyBody = t.Omit(insertSchema, [
  "createdAt",
  "updatedAt",
  "approved",
]);
export type CreateCompanyBody = Static<typeof CreateCompanyBody>;

// ------------ Udate ------------
const UpdateCompanyBody = t.Partial(CreateCompanyBody);
export type UpdateCompanyBody = Static<typeof UpdateCompanyBody>;

// ------------ Query ------------
const CompaniesQueryFilters = t.Object({
  search: t.Optional(t.String()),
  type: t.Optional(CompanyType),
  approved: t.Optional(t.BooleanString()),
  ...QueriesMeta,
});
export type CompaniesQueryFilters = Static<typeof CompaniesQueryFilters>;

// ------------ Handlers ------------
const CParams = t.Object({ compnayId: ID });
type CParams = Static<typeof CParams>;

// ------------ Contexts Types ------------
export interface CoCTXs {
  CreateCoCtx: Ctx<CreateCompanyBody>;
  ApproveCoCtx: Ctx<UpdateCompanyBody, CParams>;
  QueryCoCtx: Ctx<unknown, unknown, CompaniesQueryFilters>;
  UpdateCoCtx: Ctx<UpdateCompanyBody, CParams>;
  DelCoCtx: Ctx<unknown, CParams>;
}

// ------------ Contexts Validators ------------
export const CoSchema = {
  CreateCoValidators: {
    body: CreateCompanyBody,
    detail: {
      summary: "Create a company",
      tags: ["Companies"],
    },
  },
  ApproveCoValidators: {
    params: CParams,
    body: UpdateCompanyBody,
    detail: {
      summary: "Approve a company",
      tags: ["Admin - Companies"],
    },
  },
  UpdateCoValidators: {
    params: CParams,
    body: UpdateCompanyBody,
    detail: {
      summary: "Update a company",
      tags: ["Admin - Companies"],
    },
  },
  DelCoValidators: {
    params: CParams,
    detail: {
      summary: "Delete a company",
      tags: ["Admin - Companies"],
    },
  },
  QueryCoValidators: {
    query: CompaniesQueryFilters,
    detail: {
      summary: "List companies",
      tags: ["Companies"],
    },
  },
};
