import Elysia, { t } from "elysia";
import * as handlers from "./handlers";
import { AdminCreateUserBody } from "./schema";

export const usersRouter = new Elysia({ prefix: "/users" })
  .get("/", handlers.getAllUsers)
  .get("/:id", handlers.getUserById, {
    params: t.Object({ id: t.Number() }),
  })
  //
  .post("/", handlers.adminCreateUser, {
    body: AdminCreateUserBody,
  });
