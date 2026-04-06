import { t, type Static } from "elysia";

export const CreateNewShopBody = t.Object({
  ownerId: t.Optional(t.Number()),
  name: t.String(),
  logo: t.Optional(t.String()),
});

export type CreateNewShopBody = Static<typeof CreateNewShopBody>;
