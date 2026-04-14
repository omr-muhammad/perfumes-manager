import Elysia from "elysia";
import { userAdminRouter } from "../users/userAdminRouter";
import { protect } from "../../utils/auth";
import { shopsAdminRouter } from "../shops/shopsAdminRouter";

export const adminRouter = new Elysia({ prefix: "/admin" })
  .use(protect)
  .onBeforeHandle(({ authPayload, status }) => {
    if (authPayload.role !== "admin") return status(403);
  })
  .group("/users", (app) => app.use(userAdminRouter))
  .group("/shops", (app) => app.use(shopsAdminRouter));
