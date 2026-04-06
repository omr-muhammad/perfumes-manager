import { t, type Static } from "elysia";

const AddressBase = t.Object({
  country: t.String(),
  city: t.String(),
  district: t.Optional(t.String()),
  street: t.String(),
  buildingNumber: t.Optional(t.Number()),
  notes: t.Optional(t.String()),
});

export const CreateNewShopBody = t.Object({
  ownerId: t.Optional(t.Number()),
  name: t.String(),
  logo: t.Optional(t.String()),
  address: t.Optional(AddressBase),
});

export type CreateNewShopBody = Static<typeof CreateNewShopBody>;
export type NewShop = Omit<CreateNewShopBody, "address">;
export type Address = Static<typeof AddressBase>;
