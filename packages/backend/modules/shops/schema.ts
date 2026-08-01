import { t, type Static } from "elysia";
import { createInsertSchema } from "drizzle-typebox";
import {
  AddressBase,
  HandleActivationBody,
  ID,
  QueriesMeta,
  ShopParams,
  ShopRole,
  // ShopRole,
  Url,
  UserStaff,
  type Address,
  type Ctx,
} from "../../utils/globalSchema";
import { shopsTable } from "../../db/schema";

const DerivedShopSchema = createInsertSchema(shopsTable);

// -------------- Create Shop --------------
const CreateShop = t.Omit(DerivedShopSchema, [
  "ownerId",
  "createdAt",
  "updatedAt",
  "active",
]);
export type CreateShop = Static<typeof CreateShop>;

const CreateShopBody = t.Object({
  ownerId: t.Optional(ID),
  name: t.String(),
  logo: t.Optional(Url),
  address: t.Optional(AddressBase),
});
export type CreateShopBody = Static<typeof CreateShopBody>;

// -------------- Update Shop --------------
const UpdateShopBody = t.Partial(CreateShop);
export type UpdateShopBody = Static<typeof UpdateShopBody>;

const HideShopBody = t.Object({ hidden: t.Boolean() });
export type HideShopBody = Static<typeof HideShopBody>;

// -------------- Create Shop Staff --------------
const StaffBody = t.Omit(UserStaff, [
  "active",
  "createdAt",
  "updatedAt",
  "tokenVersion",
]);
export type StaffBody = Static<typeof StaffBody>;

// -------------- Update Shop Staff --------------
const UpdateStaffBody = t.Object({
  role: ShopRole,
});
export type UpdateStaffBody = Static<typeof UpdateStaffBody>;

// -------------- Query Shop --------------
const ShopsQueryFilters = t.Partial(
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
const TStaffParams = t.Object({
  shopId: ID,
  staffId: ID,
});
type TStaffParams = Static<typeof TStaffParams>;

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
  CreateStaff: Ctx<StaffBody, ShopParams>;
  RmStaff: Ctx<unknown, TStaffParams>;
  QueryShopStaff: Ctx<unknown, ShopParams>;
  UpdateStaff: Ctx<UpdateStaffBody, TStaffParams>;
}

// ------------- Contexts Schema -------------
export const ShopSchema = {
  CreateShop: {
    body: CreateShopBody,
    detail: { summary: "Create a shop", tags: ["Shops"] },
  },
  Query: {
    query: ShopsQueryFilters,
    detail: { summary: "List my shops", tags: ["Shops"] },
  },
  QueryById: {
    params: ShopParams,
    detail: { summary: "Get a shop by id", tags: ["Shops"] },
  },
  DelShop: {
    params: ShopParams,
    detail: { summary: "Delete a shop", tags: ["Shops"] },
  },
  UpdateShop: {
    params: ShopParams,
    body: UpdateShopBody,
    detail: { summary: "Update a shop", tags: ["Shops"] },
  },
  Activation: {
    params: ShopParams,
    body: HandleActivationBody,
    detail: {
      summary: "Activate or deactivate a shop",
      tags: ["Admin - Shops"],
    },
  },
  Visibility: {
    params: ShopParams,
    body: HideShopBody,
    detail: { summary: "Show or hide a shop", tags: ["Shops"] },
  },
  UpsertShopAddress: {
    params: ShopParams,
    body: AddressBase,
    detail: { summary: "Set or replace a shop's address", tags: ["Shops"] },
  },

  // Shop Staff
  CreateStaff: {
    params: ShopParams,
    body: StaffBody,
    detail: {
      summary: "Add a staff member to a shop",
      tags: ["Shop Staff"],
    },
  },
  UpdateStaff: {
    params: TStaffParams,
    body: UpdateStaffBody,
    detail: {
      summary: "Update a shop staff member",
      tags: ["Shop Staff"],
    },
  },
  DelStaff: {
    params: TStaffParams,
    detail: {
      summary: "Remove a shop staff member",
      tags: ["Shop Staff"],
    },
  },
  QueryShopStaff: {
    params: ShopParams,
    detail: { summary: "List staff for a shop", tags: ["Shop Staff"] },
  },

  // Admin-only views — same params as their owner-facing counterparts above,
  // kept separate only because the tag/summary differs by audience.
  AdminQuery: {
    detail: { summary: "List all shops", tags: ["Admin - Shops"] },
  },
  AdminQueryById: {
    params: ShopParams,
    detail: { summary: "Get a shop by id", tags: ["Admin - Shops"] },
  },
  AdminDelShop: {
    params: ShopParams,
    detail: { summary: "Delete a shop", tags: ["Admin - Shops"] },
  },
};
