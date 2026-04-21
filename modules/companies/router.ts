import Elysia from "elysia";
import { protect } from "../../utils/auth";
import * as handlers from "./handlers";
import { CreateCoValidators, QueryCoValidators } from "./schema";

export const companiesRouter = new Elysia({ prefix: "/companies" })
  .use(protect)
  .post("", handlers.createCompany, CreateCoValidators)
  .get("", handlers.getAllCompanies, QueryCoValidators);
