import Elysia from "elysia";
import * as handlers from "./handlers";
import { AdminCreateUserBody } from "./schema";

export const usersRouter = new Elysia({ prefix: "/users" }).post(
  "/",
  handlers.adminCreateUser,
  {
    body: AdminCreateUserBody,
  },
);
