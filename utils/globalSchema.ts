import { Cookie, status, t, type Static } from "elysia";
import { authJWTPlugin } from "./jwtPlugin";
import type { db } from "../db/config";
import { addressesTable, usersTable } from "../db/schema";
import { createInsertSchema } from "drizzle-typebox";
import { langEn, roleEn, staffEn } from "../db/schema/enums";
import { enumToUnion } from "./unionToLiteral";

// ------------------- GLOBALS -------------------
type AuthId = { ownerId: number };
export type WithAuth<T> = T & AuthId;
export interface InvAuth {
  ownerId: number;
  shopId: number;
}

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

export const AppLanguage = enumToUnion(langEn);
export type AppLanguage = Static<typeof AppLanguage>;

export const AppRole = enumToUnion(roleEn);
export type AppRole = Static<typeof AppRole>;

export const ShopRole = enumToUnion(staffEn);
export type ShopRole = Static<typeof ShopRole>;

export const User = createInsertSchema(usersTable, {
  email: Email,
});
export const UserStaff = createInsertSchema(usersTable, {
  role: ShopRole,
});

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
