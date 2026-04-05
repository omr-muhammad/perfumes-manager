import { StatusMap, t, type Static } from "elysia";

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

export const AdminUpdateUserBody = t.Object({
  name: t.Optional(t.String()),
  email: t.Optional(t.String()),
  language: t.Optional(t.Union([t.Literal("ar"), t.Literal("en")])),
  role: t.Optional(
    t.Union([t.Literal("owner"), t.Literal("staff"), t.Literal("customer")]),
  ),
  password: t.Optional(t.String()),
  phone: t.Optional(t.String()),
});
export type AdminUpdateUserBody = Static<typeof AdminUpdateUserBody>;

export const UpdateUserBody = t.Partial(
  t.Omit(AdminUpdateUserBody, ["password", "role"]),
);
export type UpdateUserBody = Static<typeof UpdateUserBody>;

export const ChangePasswordBody = t.Object({
  oldPw: t.String(),
  newPw: t.String(),
});
export type ChangePasswordBody = Static<typeof ChangePasswordBody>;

export const SignupBody = t.Object({
  name: t.String(),
  email: t.String(),
  password: t.String(),
  language: t.Optional(t.Union([t.Literal("ar"), t.Literal("en")])),
  phone: t.Optional(t.String()),
  keepLogin: t.Boolean({ default: false }),
});
export type SignupBody = Static<typeof SignupBody>;

export const LoginBody = t.Object({
  email: t.String(),
  password: t.String(),
  keepLogin: t.Boolean({ default: false }),
});
export type LoginBody = Static<typeof LoginBody>;
