import Elysia, { t } from "elysia";
import * as handlers from "./handlers";
import {
  AdminCreateUserBody,
  UpdatePasswordBody,
  UpdateUserBody,
} from "./schema";

export const usersRouter = new Elysia({ prefix: "/users" })
  .get("/", handlers.getAllUsers)
  .get("/:id", handlers.getUserById, {
    params: t.Object({ id: t.Number() }),
  })
  //
  .post("/", handlers.adminCreateUser, {
    body: AdminCreateUserBody,
  })
  //
  .patch("/:id", handlers.updateUser, {
    params: t.Object({ id: t.Number() }),
    body: UpdateUserBody,
  })
  .patch("/:id/update-password", handlers.updateUserPassword, {
    params: t.Object({ id: t.Number() }),
    body: UpdatePasswordBody,
  });
