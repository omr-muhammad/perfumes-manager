import { t, type Static } from "elysia";

export const UserPayload = t.Object({
  userId: t.Number(),
  role: t.Union([
    t.Literal("admin"),
    t.Literal("owner"),
    t.Literal("staff"),
    t.Literal("customer"),
  ]),
});
export type UserPayload = Static<typeof UserPayload>;
