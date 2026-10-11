import type { backend } from "@/api/client";
import type { Treaty } from "@elysia/eden";

export type LoggedUser = NonNullable<
  Treaty.Data<typeof backend.api.users.profile.get>["data"]
>["user"];
export type FormUser = Pick<
  LoggedUser,
  "name" | "username" | "email" | "phone"
>;
export type UserUpdates = Parameters<typeof backend.api.users.profile.patch>[0];
export type UpdatePassword = Parameters<
  (typeof backend.api.users.profile)["change-password"]["patch"]
>[0];
