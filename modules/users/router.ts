import Elysia, { t } from "elysia";
import * as handlers from "./handlers";
import {
  SignupBody,
  ChangePasswordBody,
  LoginBody,
  UpdateUserBody,
} from "./schema";
import { authJWTPlugin } from "../../utils/jwtPlugin";
import { protect } from "../../utils/auth";
import { AddressBase } from "../../utils/globalSchema";

export const usersRouter = new Elysia({ prefix: "/users" })
  .use(authJWTPlugin)
  .post("/signup", handlers.signup, {
    body: SignupBody,
  })
  .post("/login", handlers.login, {
    body: LoginBody,
  })
  .use(protect)
  .group("/profile", (app) =>
    app
      .get("", handlers.getMe)
      //
      .patch("", handlers.updateMe, {
        body: UpdateUserBody,
      })
      .patch("/change-password", handlers.changePassword, {
        body: ChangePasswordBody,
      })
      //
      .put("/address", handlers.upsertUserAddress, {
        body: AddressBase,
      })
      //
      .delete("", handlers.deleteMe, {
        body: t.Object({ password: t.String() }),
      }),
  );
