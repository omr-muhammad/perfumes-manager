import { Cookie, status, t, type Static } from "elysia";
import { authJWTPlugin } from "./jwtPlugins";

export type CtxCookie = Record<string, Cookie<unknown>>;
export type AuthJWT =
  (typeof authJWTPlugin)["~Singleton"]["decorator"]["authJWT"];

export const UserPayload = t.Object({
  userId: t.Number(),
  role: t.Union([
    t.Literal("admin"),
    t.Literal("owner"),
    t.Literal("staff"),
    t.Literal("customer"),
  ]),
});
export type UserPayload = Static<typeof UserPayload>;

export type Ctx<TBody = unknown, TParams = unknown> = {
  authJWT: AuthJWT;
  body: TBody;
  params: TParams;
  cookie: CtxCookie;
  authPayload: UserPayload;
  status: typeof status;
};

export type CtxWithoutPayload<TBody = unknown, TParams = unknown> = Omit<
  Ctx<TBody, TParams>,
  "authPayload"
>;

export const TParams = t.Object({ id: t.Number() });
export type TParams = Static<typeof TParams>;
export const TStaffParams = t.Object({
  id: t.Number(),
  staffId: t.Number(),
});
export type TStaffParams = Static<typeof TStaffParams>;
