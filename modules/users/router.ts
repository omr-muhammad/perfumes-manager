import Elysia, { t } from "elysia";
import * as handlers from "./handlers";
import {
  AdminCreateUserBody,
  SignupBody,
  ChangePasswordBody,
  AdminUpdateUserBody,
  LoginBody,
  UpdateUserBody,
} from "./schema";
import { authJWTPlugin } from "../../utils/jwtPlugins";
import { UserPayload } from "../../utils/globalSchema";

export const usersRouter = new Elysia({ prefix: "/users" })
  .use(authJWTPlugin)
  .post("/signup", handlers.signup, {
    authJWT: authJWTPlugin,
    body: SignupBody,
  })
  .post("/login", handlers.login, {
    authJWT: authJWTPlugin,
    body: LoginBody,
  })
  .resolve(async ({ cookie: { authToken }, authJWT }) => {
    if (!authToken || typeof authToken.value !== "string")
      throw new Error("Unauthorized.");

    const token = authToken.value;
    const payload = await authJWT.verify(token);

    if (!payload) throw new Error("Unauthorized.");

    console.log("payload", payload);
    return { authPayload: payload };
  })
  .group("/admin", (app) =>
    app
      .onBeforeHandle(({ authPayload, status }) => {
        if (authPayload.role !== "admin") return status(403);
      })
      .get("/", handlers.getAllUsers)
      .get("/:id", handlers.getUserById, {
        params: t.Object({ id: t.Number() }),
        authPayload: UserPayload,
      })
      .post("/", handlers.adminCreateUser, {
        body: AdminCreateUserBody,
      })
      .patch("/:id", handlers.adminUpdateUser, {
        params: t.Object({ id: t.Number() }),
        body: AdminUpdateUserBody,
      }),
  )
  //
  .patch("/", handlers.updateMe, {
    body: UpdateUserBody,
  })
  .patch("/:id/update-password", handlers.changePassword, {
    params: t.Object({ id: t.Number() }),
    body: ChangePasswordBody,
  });
