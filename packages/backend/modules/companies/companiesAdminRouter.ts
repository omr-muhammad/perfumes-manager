import Elysia from "elysia";
import { protect } from "../../utils/auth";
import * as handlers from "./handlers";
import { CoSchema } from "./schema";

export const companiesAdminRouter = new Elysia()
  .use(protect)
  .patch(
    "/:companyId/approve",
    handlers.approveCompany,
    CoSchema.ApproveCoValidators,
  )
  .patch("/:companyId", handlers.updateCompany, CoSchema.UpdateCoValidators)
  .delete("/:companyId", handlers.deleteCompany, CoSchema.DelCoValidators);
