import { t, type Static } from "elysia";
import { createInsertSchema } from "drizzle-typebox";
import {
  AddressBase,
  HandleActivationBody,
  ID,
  QueriesMeta,
  ShopParams,
  ShopRole,
  Url,
  UserStaff,
  type Address,
  type Ctx,
} from "../../utils/globalSchema";
import { shopsTable } from "../../db/schema";

const DerivedShopSchema = createInsertSchema(shopsTable);

// -------------- Create Shop --------------
export const CreateShop = t.Omit(DerivedShopSchema, [
  "ownerId",
  "createdAt",
  "updatedAt",
  "active",
]);
export type CreateShop = Static<typeof CreateShop>;

export const CreateShopBody = t.Object({
  ownerId: t.Optional(ID),
  name: t.String({ error: "Shop name must be a string." }),
  logo: t.Optional(Url),
  address: t.Optional(AddressBase),
});
export type CreateShopBody = Static<typeof CreateShopBody>;

// -------------- Update Shop --------------
export const UpdateShopBody = t.Partial(CreateShop);
export type UpdateShopBody = Static<typeof UpdateShopBody>;

export const HideShopBody = t.Object({ hidden: t.Boolean() });
export type HideShopBody = Static<typeof HideShopBody>;

// -------------- Create Shop Staff --------------
export const StaffBody = t.Omit(UserStaff, [
  "active",
  "createdAt",
  "updatedAt",
  "tokenVersion",
]);
export type StaffBody = Static<typeof StaffBody>;

// -------------- Update Shop Staff --------------
export const UpdateStaffBody = t.Object({
  role: ShopRole,
});
export type UpdateStaffBody = Static<typeof UpdateStaffBody>;

// -------------- Query Shop --------------
export const ShopsQueryFilters = t.Partial(
  t.Object({
    search: t.String(),
    country: t.String(),
    city: t.String(),
    district: t.String(),
    ...QueriesMeta,
  }),
);
export type ShopsQueryFilters = Static<typeof ShopsQueryFilters>;

// -------------- URL Params --------------
export const TStaffParams = t.Object({
  shopId: ID,
  staffId: ID,
});
export type TStaffParams = Static<typeof TStaffParams>;

// ------------- Contexts -------------
export interface ShopsCTXs {
  CreateShop: Ctx<CreateShopBody>;
  UpdateShop: Ctx<UpdateShopBody, ShopParams>;
  UpsertShopAddress: Ctx<Address, ShopParams>;
  DelShop: Ctx<unknown, ShopParams>;
  QueryShops: Ctx<unknown, unknown, ShopsQueryFilters>;
  QueryShopById: Ctx<unknown, ShopParams>;
  Activation: Ctx<HandleActivationBody, ShopParams>;
  HideShop: Ctx<HideShopBody, ShopParams>;
}

export interface ShopStaffCTXs {
  CreateStaff: Ctx<StaffBody, TStaffParams>;
  RmStaff: Ctx<unknown, TStaffParams>;
  QueryShopStaff: Ctx<unknown, ShopParams>;
  UpdateStaff: Ctx<UpdateStaffBody, TStaffParams>;
}

// ------------- Contexts Schema -------------
export const ShopSchema = {
  CreateShop: { body: CreateShopBody },
  Query: { query: ShopsQueryFilters },
  QueryById: { params: ShopParams },
  DelShop: { params: ShopParams },
  UpdateShop: { params: ShopParams, body: UpdateShopBody },
  Activation: { params: ShopParams, body: HandleActivationBody },
  Visibility: { params: ShopParams, body: HideShopBody },
  UpsertShopAddress: { params: ShopParams, body: AddressBase },
  // Shop Staff
  CreateStaff: { params: TStaffParams, body: StaffBody },
  UpdateStaff: { params: TStaffParams, body: UpdateStaffBody },
  DelStaff: { params: TStaffParams },
  QueryShopStaff: { params: ShopParams },
};
