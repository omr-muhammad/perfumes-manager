import Elysia from "elysia";
import { protect, restrictTo } from "../../utils/auth";
import { userAdminRouter } from "../users/userAdminRouter";
import { shopsAdminRouter } from "../shops/shopsAdminRouter";
import { companiesAdminRouter } from "../companies/companiesAdminRouter";
import { perfumesAdminRouter } from "../perfumes/perfumeAdminRouter";

export const adminRouter = new Elysia({ prefix: "/admin" })
  .use(protect)
  .use(restrictTo("admin"))
  // done
  .group("/companies", (app) => app.use(companiesAdminRouter))
  .group("/perfumes", (app) => app.use(perfumesAdminRouter))
  .group("/shops", (app) => app.use(shopsAdminRouter))
  .group("/users", (app) => app.use(userAdminRouter));
// progress...
