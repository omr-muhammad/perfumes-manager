import { t, type Static } from "elysia";

export const AdminCreateUserBody = t.Object({
  name: t.String(),
  email: t.String(),
  password: t.String(),
  role: t.Optional(
    t.Union([t.Literal("owner"), t.Literal("staff"), t.Literal("customer")]),
  ),
  language: t.Optional(t.Union([t.Literal("ar"), t.Literal("en")])),
  phone: t.Optional(t.String()),
});
export type AdminCreateUserBody = Static<typeof AdminCreateUserBody>;
