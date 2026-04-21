import Elysia from "elysia";
import { protect } from "../../utils/auth";
import { userAdminRouter } from "../users/userAdminRouter";
import { shopsAdminRouter } from "../shops/shopsAdminRouter";
import { companiesAdminRouter } from "../companies/companiesAdminRouter";

export const adminRouter = new Elysia({ prefix: "/admin" })
  .use(protect)
  .onBeforeHandle(({ authPayload, status }) => {
    if (authPayload.role !== "admin") return status(403);
  })
  // done
  .group("/companies", (app) => app.use(companiesAdminRouter))
  // progress...
  .group("/users", (app) => app.use(userAdminRouter))
  .group("/shops", (app) => app.use(shopsAdminRouter));
