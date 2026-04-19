import Elysia, { t } from "elysia";
import * as handlers from "./handlers";
import {
  CreateCompanyBody,
  ApproveCompnayBody,
  UpdateCompanyBody,
  CParams,
  CompaniesQueryFilters,
} from "./schema";
import { protect } from "../../utils/auth";

export const companiesRouter = new Elysia({ prefix: "/companies" })
  .use(protect)
  .post("/", handlers.createCompany, {
    body: CreateCompanyBody,
  })
  //
  .patch("/:companyId/approve", handlers.approveCompany, {
    params: CParams,
    body: ApproveCompnayBody,
  })
  //
  .get("/", handlers.getAllCompanies, {
    query: CompaniesQueryFilters,
  })
  //
  .patch("/:companyId", handlers.updateCompany, {
    params: CParams,
    body: UpdateCompanyBody,
  })
  //
  .delete("/:companyId", handlers.deleteCompany, {
    params: CParams,
  });
