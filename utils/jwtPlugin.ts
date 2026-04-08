import jwt from "@elysiajs/jwt";
import Elysia, { t } from "elysia";

const JWTSchema = t.Object({
  userId: t.Number(),
  role: t.Union([
    t.Literal("admin"),
    t.Literal("owner"),
    t.Literal("staff"),
    t.Literal("customer"),
  ]),
});

// 1. The Provider: Gives you access to authJWT.sign() and .verify()
export const authJWTPlugin = jwt({
  name: "authJWT",
  secret: process.env.jwt_secret as string,
  exp: process.env.jwt_exp,
  schema: JWTSchema,
});

// name: "auth" works as Singleton to make it run once per route even if used more
export const authPlugin = new Elysia({ name: "auth" }).use(authJWTPlugin);
