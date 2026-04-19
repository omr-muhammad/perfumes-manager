import { Cookie, status, t, type Static } from "elysia";
import { authJWTPlugin } from "./jwtPlugin";
import type { db } from "../db/config";
import type { InferSelectModel } from "drizzle-orm";
import type { shopsStaffTable, usersTable } from "../db/schema";

export const ID = t.Number({
  minimum: 1,
  error: "Invalid id, expected a positive number",
});

export const AddressBase = t.Object({
  country: t.String(),
  city: t.String(),
  district: t.Optional(t.String()),
  street: t.String(),
  buildingNumber: t.Optional(t.Number()),
  notes: t.Optional(t.String()),
});
export type Address = Static<typeof AddressBase>;

export const UpdateAddressBody = t.Partial(AddressBase);
export type UpdateAddressBody = Static<typeof UpdateAddressBody>;

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
  tokenV: t.Number(),
});
export type UserPayload = Static<typeof UserPayload>;

export type Ctx<TBody = unknown, TParams = unknown> = {
  authJWT: AuthJWT;
  body: TBody;
  params: TParams;
  cookie: CtxCookie;
  authPayload: UserPayload;
  status: typeof status;
  request: Request;
  query: Record<string, string | undefined | number | boolean>;
};

export type CtxWithoutPayload<TBody = unknown, TParams = unknown> = Omit<
  Ctx<TBody, TParams>,
  "authPayload"
>;

export const HandleActiveBody = t.Object({ active: t.Boolean() });
export type HandleActiveBody = Static<typeof HandleActiveBody>;

export const UserParams = t.Object({ userId: ID });
export type UserParams = Static<typeof UserParams>;

export const ShopParams = t.Object({ shopId: ID });
export type ShopParams = Static<typeof ShopParams>;
export const TStaffParams = t.Object({
  shopId: ID,
  staffId: ID,
});
export type TStaffParams = Static<typeof TStaffParams>;

export const AlcoInvParams = t.Object({
  shopId: ID,
  alcoholId: ID,
});
export type AlcoInvParams = Static<typeof AlcoInvParams>;

let _tx: Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DbTx = typeof _tx;

//
export type AppRole = InferSelectModel<typeof usersTable>["role"];
export type ShopRole = InferSelectModel<typeof shopsStaffTable>["role"];

//
export const QueriesMeta = {
  page: t.Number({ minimum: 1, default: 1 }),
  limit: t.Number({ minimum: 10, default: 20, maximum: 100 }),
};
