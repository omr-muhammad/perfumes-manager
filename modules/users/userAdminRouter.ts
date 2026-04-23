import Elysia from "elysia";

import { protect } from "../../utils/auth";

import * as handlers from "./handlers";
import { UserSchema } from "./schema";

export const userAdminRouter = new Elysia()
  .use(protect)
  .get("", handlers.getAllUsers)
  .post("", handlers.adminCreateUser, UserSchema.AdminCreate)
  .group("/:userId", (app) =>
    app
      .get("", handlers.getUserById, UserSchema.AdminGetUser)
      .patch("/active", handlers.handleActivation, UserSchema.Activation)
      .delete("", handlers.deleteUser, UserSchema.AdminDelUser),
  );
