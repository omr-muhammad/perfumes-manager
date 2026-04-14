import { t, type Static } from "elysia";
import { shopStaff } from "../../db/schema/shopStaff";
import { createInsertSchema } from "drizzle-typebox";
import { AddressBase } from "../../utils/globalSchema";

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

export const StaffBody = t.Object({
  email: t.String(),
  role: StaffRole.properties.role,
});
export type StaffBody = Static<typeof StaffBody>;

export const UpdateStaffBody = t.Object({
  role: StaffRole.properties.role,
});
export type UpdateStaffBody = Static<typeof UpdateStaffBody>;

export const HideShopBody = t.Object({ hidden: t.Boolean() });
export type HideShopBody = Static<typeof HideShopBody>;
