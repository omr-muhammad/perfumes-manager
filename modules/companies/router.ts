import Elysia from "elysia";
import { protect } from "../../utils/auth";
import * as handlers from "./handlers";
import { CoSchema } from "./schema";

export const companiesRouter = new Elysia({ prefix: "/companies" })
  .use(protect)
  .post("", handlers.createCompany, CoSchema.CreateCoValidators)
  .get("", handlers.getAllCompanies, CoSchema.QueryCoValidators);
