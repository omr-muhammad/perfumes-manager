import Elysia, { t } from "elysia";
import * as handlers from "./handlers";
import {
  CreateCompanyBody,
  ApproveCompnayBody,
  UpdateCompanyBody,
  CParams,
} from "./schema";
import { protect } from "../../utils/auth";

export const companiesRouter = new Elysia({ prefix: "/companies" })
  .use(protect)
  .post("/", handlers.createCompany, {
    body: CreateCompanyBody,
  })
  //
  .patch("/:id/approve", handlers.approveCompany, {
    params: t.Object({ id: t.Number() }),
    body: ApproveCompnayBody,
  })
  //
  .get("/", handlers.getAllCompanies)
  //
  .get("/dashboard", handlers.getAllCompanies, {
    beforeHandle({ authPayload, status }) {
      if (!["admin", "owner"].includes(authPayload.role)) return status(403);
    },
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
