import { createInsertSchema } from "drizzle-typebox";
import { t, type Static } from "elysia";
import { usersTable } from "../../db/schema";

export const AdminCreateUserBody = createInsertSchema(usersTable);
export type AdminCreateUserBody = Static<typeof AdminCreateUserBody>;

export const UpdateUserBody = t.Partial(
  t.Omit(AdminCreateUserBody, ["password", "role", "active"]),
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

export const HandleActiveBody = t.Object({ active: t.Boolean() });
export type HandleActiveBody = Static<typeof HandleActiveBody>;
