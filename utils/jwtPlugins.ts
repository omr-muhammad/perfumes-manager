import jwt from "@elysiajs/jwt";
import { t } from "elysia";

const JWTSchema = t.Object({
  userId: t.Number(),
  role: t.Union([
    t.Literal("admin"),
    t.Literal("owner"),
    t.Literal("staff"),
    t.Literal("customer"),
  ]),
});

export const authJWTPlugin = jwt({
  name: "authJWT",
  secret: process.env.jwt_secret as string,
  exp: process.env.jwt_exp,
  schema: JWTSchema,
});
export type AuthJWT =
  (typeof authJWTPlugin)["~Singleton"]["decorator"]["authJWT"];
