import { t, type Static } from "elysia";
import { shopStaff } from "../../db/schema/shopStaff";
import { createInsertSchema } from "drizzle-typebox";
import { AddressBase, QueriesMeta } from "../../utils/globalSchema";
import { usersTable } from "../../db/schema";

const userSchema = createInsertSchema(usersTable, {
  role: t.Union([t.Literal("manager"), t.Literal("cashier")]),
});
export const ShopStaffSchema = createInsertSchema(shopStaff);

export const CreateShopBody = t.Object({
  ownerId: t.Optional(t.Number()),
  name: t.String(),
  logo: t.Optional(t.String()),
  address: t.Optional(AddressBase),
});
export type CreateShopBody = Static<typeof CreateShopBody>;
export type NewShop = Omit<CreateShopBody, "address" | "ownerId">;

export const UpdateShopBody = t.Partial(
  t.Omit(CreateShopBody, ["ownerId", "address"]),
);
export type UpdateShopBody = Static<typeof UpdateShopBody>;

export const StaffRole = t.Pick(ShopStaffSchema, ["role"]);
export type StaffRole = Static<typeof StaffRole>;

export const StaffBody = t.Omit(userSchema, [
  "active",
  "createdAt",
  "updatedAt",
]);
export type StaffBody = Static<typeof StaffBody>;

export const UpdateStaffBody = t.Object({
  role: StaffRole.properties.role,
});
export type UpdateStaffBody = Static<typeof UpdateStaffBody>;

export const HideShopBody = t.Object({ hidden: t.Boolean() });
export type HideShopBody = Static<typeof HideShopBody>;

// -------------- Query --------------
export const ShopsQueryFilters = t.Optional(
  t.Object({
    search: t.String(),
    country: t.String(),
    city: t.String(),
    district: t.String(),
    ...QueriesMeta,
  }),
);
export type ShopsQueryFilters = Static<typeof ShopsQueryFilters>;
