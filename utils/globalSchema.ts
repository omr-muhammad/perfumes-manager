import { Cookie, status, t, type Static } from "elysia";
import { authJWTPlugin } from "./jwtPlugin";
import type { db } from "../db/config";
import type { InferSelectModel } from "drizzle-orm";
import { addressesTable, usersTable, type shopsStaffTable } from "../db/schema";
import { createInsertSchema } from "drizzle-typebox";

// ------------------- GLOBALS -------------------
export const ID = t.Number({
  minimum: 1,
  error: "Invalid id, expected a positive number",
});
export const Email = t.String({
  format: "email",
  error: "Invalid format, please provide a valid email.",
});
export const Url = t.String({
  format: "uri",
  error: "Invalid format, please provide a valid URL",
});

export const AppLanguage = t.Union([t.Literal("ar"), t.Literal("en")]);

export const AppRole = t.Union([
  t.Literal("admin"),
  t.Literal("owner"),
  t.Literal("staff"),
  t.Literal("customer"),
]);
export type AppRole = InferSelectModel<typeof usersTable>["role"];

export const ShopRole = t.Union([t.Literal("manager"), t.Literal("cashier")]);
export type ShopRole = InferSelectModel<typeof shopsStaffTable>["role"];

export const User = createInsertSchema(usersTable, {
  email: Email,
});
export const UserStaff = createInsertSchema(usersTable, {
  role: ShopRole,
});
// t.Object({
//   country: t.String(),
//   city: t.String(),
//   district: t.Optional(t.String()),
//   street: t.String(),
//   buildingNumber: t.Optional(t.Number()),
//   notes: t.Optional(t.String()),
// });

// ------------------- Address -------------------
const addressSchema = createInsertSchema(addressesTable);
export const AddressBase = t.Omit(addressSchema, [
  "updatedAt",
  "createdAt",
  "shopId",
  "userId",
]);
export type Address = Static<typeof AddressBase>;

export const UpdateAddressBody = t.Partial(AddressBase);
export type UpdateAddressBody = Static<typeof UpdateAddressBody>;

// ------------------- Context Cookies -------------------
export type CtxCookie = Record<string, Cookie<unknown>>;

// ------------------- authJWT -------------------
export type AuthJWT =
  (typeof authJWTPlugin)["~Singleton"]["decorator"]["authJWT"];

// ------------------- JWT Payload -------------------
export const UserPayload = t.Object({
  userId: ID,
  role: AppRole,
  tokenV: t.Number(),
});
export type UserPayload = Static<typeof UserPayload>;

// ------------------- Handlers Context -------------------
export type Ctx<
  TBody = unknown,
  TParams = unknown,
  TQuery = Record<string, any>,
> = {
  authJWT: AuthJWT;
  body: TBody;
  params: TParams;
  cookie: CtxCookie;
  authPayload: UserPayload;
  status: typeof status;
  request: Request;
  query: TQuery;
};

export type CtxWithoutPayload<
  TBody = unknown,
  TParams = unknown,
  TQuery = Record<string, any>,
> = Omit<Ctx<TBody, TParams, TQuery>, "authPayload">;

export const HandleActivationBody = t.Object({ active: t.Boolean() });
export type HandleActivationBody = Static<typeof HandleActivationBody>;

export const ShopParams = t.Object({ shopId: ID });
export type ShopParams = Static<typeof ShopParams>;

let _tx: Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DbTx = typeof _tx;

export const QueriesMeta = {
  page: t.Number({ minimum: 1, default: 1 }),
  limit: t.Number({ minimum: 10, default: 20, maximum: 100 }),
};
