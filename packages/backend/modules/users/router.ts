import Elysia, { t } from "elysia";

import * as handlers from "./handlers";
import { UserSchema } from "./schema";

import { authJWTPlugin } from "../../utils/jwtPlugin";
import { protect } from "../../utils/auth";

export const usersRouter = new Elysia({ prefix: "/users" })
  .use(authJWTPlugin)
  .post("/signup", handlers.signup, UserSchema.Signup)
  .post("/login", handlers.login, UserSchema.Login)
  .use(protect)
  .group("/profile", (app) =>
    app
      .get("", handlers.getMe)
      .post("/logout", handlers.logout)
      .patch("", handlers.updateMe, UserSchema.UpdateMe)
      .patch("/change-password", handlers.changePassword, UserSchema.ChangePW)
      .put("/address", handlers.upsertUserAddress, UserSchema.UpsertAddress)
      .delete("", handlers.deleteMe, UserSchema.DelMe),
  );
