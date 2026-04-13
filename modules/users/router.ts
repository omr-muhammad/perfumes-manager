import Elysia, { t } from "elysia";
import * as handlers from "./handlers";
import {
  AdminCreateUserBody,
  SignupBody,
  ChangePasswordBody,
  AdminUpdateUserBody,
  LoginBody,
  UpdateUserBody,
  ActiveBody,
} from "./schema";
import { authJWTPlugin } from "../../utils/jwtPlugin";
import { UserParams, UserPayload } from "../../utils/globalSchema";
import { protect } from "../../utils/auth";

export const usersRouter = new Elysia({ prefix: "/users" })
  .use(authJWTPlugin)
  .post("/signup", handlers.signup, {
    body: SignupBody,
  })
  .post("/login", handlers.login, {
    body: LoginBody,
  })
  .use(protect)
  .group("/admin", (app) =>
    app
      .onBeforeHandle(({ authPayload, status }) => {
        if (authPayload.role !== "admin") return status(403);
      })
      .get("", handlers.getAllUsers)
      .get("/:userId", handlers.getUserById, {
        params: UserParams,
        authPayload: UserPayload,
      })
      .post("", handlers.adminCreateUser, {
        body: AdminCreateUserBody,
      })
      .patch("/:userId", handlers.adminUpdateUser, {
        params: UserParams,
        body: AdminUpdateUserBody,
      })
      .patch("/:userId/active", handlers.handleActivation, {
        params: UserParams,
        body: ActiveBody,
      })
      .delete("/:userId", handlers.deleteUser, {
        params: UserParams,
      }),
  )
  .group("/profile", (app) =>
    app
      .get("", handlers.getMe)
      //
      .patch("", handlers.updateMe, {
        body: UpdateUserBody,
      })
      .patch("/password", handlers.changePassword, {
        body: ChangePasswordBody,
      })
      .delete("", handlers.deleteMe, {
        body: t.Object({ password: t.String() }),
      }),
  );
