import jwt from "@elysiajs/jwt";
import { t } from "elysia";

const JWTSchema = t.Object({
  userId: t.Number(),
  role: t.Enum({
    admin: "admin",
    owner: "owner",
    staff: "staff",
    customer: "customer",
  }),
});

export const authJWTPlugin = jwt({
  name: "authJWT",
  secret: process.env.jwt_secret as string,
  exp: process.env.jwt_exp,
  schema: JWTSchema,
});
export type AuthJWT =
  (typeof authJWTPlugin)["~Singleton"]["decorator"]["authJWT"];
