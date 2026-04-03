import Elysia, { t } from "elysia";
import * as handlers from "./handlers";
import {
  AdminCreateUserBody,
  SignupBody,
  ChangePasswordBody,
  AdminUpdateUserBody,
} from "./schema";
import { authJWTPlugin } from "../../utils/jwtPlugins";

export const usersRouter = new Elysia({ prefix: "/users" })
  .use(authJWTPlugin)
  .post("/signup", handlers.signup, {
    authJWT: authJWTPlugin,
    body: SignupBody,
  })
  .resolve(async ({ cookie: { authToken }, authJWT }) => {
    if (!authToken || typeof authToken.value !== "string")
      throw new Error("Unauthorized.");

    const token = authToken.value;
    const payload = await authJWT.verify(token);

    if (!payload) throw new Error("Unauthorized.");

    return { authPayload: payload };
  })
  .group("/admin", (app) =>
    app
      .onBeforeHandle(({ authPayload, status }) => {
        if (authPayload.role !== "admin") return status(403);
      })
      .get("/", handlers.getAllUsers)
      .post("/", handlers.adminCreateUser, {
        body: AdminCreateUserBody,
      })
      .patch("/:id", handlers.adminUpdateUser, {
        params: t.Object({ id: t.Number() }),
        body: AdminUpdateUserBody,
      }),
  )
  .get("/:id", handlers.getUserById, {
    params: t.Object({ id: t.Number() }),
  })
  //
  .patch("/:id/update-password", handlers.changePassword, {
    params: t.Object({ id: t.Number() }),
    body: ChangePasswordBody,
  });
