import { t, type Static } from "elysia";

const AddressBase = t.Object({
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
