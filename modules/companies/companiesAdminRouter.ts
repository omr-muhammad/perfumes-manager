import Elysia from "elysia";
import { protect } from "../../utils/auth";
import * as handlers from "./handlers";
import {
  ApproveCoValidators,
  DelCoValidators,
  UpdateCoValidators,
} from "./schema";

export const companiesAdminRouter = new Elysia()
  .use(protect)
  .patch("/:companyId/approve", handlers.approveCompany, ApproveCoValidators)
  .patch("/:companyId", handlers.updateCompany, UpdateCoValidators)
  .delete("/:companyId", handlers.deleteCompany, DelCoValidators);
