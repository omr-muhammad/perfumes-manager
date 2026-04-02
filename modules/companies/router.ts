import Elysia, { t } from "elysia";
import * as handlers from "./handlers";
import {
  AdminCreateCompanyBody,
  ApproveCompnayBody,
  UpdateCompanyBody,
} from "./schema";

export const companiesRouter = new Elysia({ prefix: "/companies" })
  .post("/", handlers.createCompany, {
    body: t.Object({
      name: t.String(),
    }),
  })
  //
  .post("/approved", handlers.adminCreate, {
    body: AdminCreateCompanyBody,
  })
  //
  .patch("/:id/approve", handlers.approveCompany, {
    params: t.Object({ id: t.Number() }),
    body: ApproveCompnayBody,
  })
  //
  .get("/", handlers.getAllCompanies)
  //
  .get("/dashboard", handlers.getAllCompanies)
  //
  .patch("/:id", handlers.updateCompany, {
    params: t.Object({ id: t.Number() }),
    body: UpdateCompanyBody,
  })
  //
  .delete("/:id", handlers.deleteCompany, {
    params: t.Object({ id: t.Number() }),
  });
