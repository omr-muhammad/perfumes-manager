import Elysia from "elysia";
import { protect } from "../../utils/auth";
import * as handlers from "./handlers";
import { UserParams, UserPayload } from "../../utils/globalSchema";
import { HandleActiveBody, AdminCreateUserBody } from "./schema";

export const userAdminRouter = new Elysia()
  .use(protect)
  .get("", handlers.getAllUsers)
  .get("/:userId", handlers.getUserById, {
    params: UserParams,
    authPayload: UserPayload,
  })
  .post("", handlers.adminCreateUser, {
    body: AdminCreateUserBody,
  })
  .patch("/:userId/active", handlers.handleActivation, {
    params: UserParams,
    body: HandleActiveBody,
  })
  .delete("/:userId", handlers.deleteUser, {
    params: UserParams,
  });
