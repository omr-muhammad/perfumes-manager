import type { backend } from "@/api/client";

export type UserUpdates = Parameters<typeof backend.api.users.profile.patch>[0];

export type UpdatePassword = Parameters<
  (typeof backend.api.users.profile)["change-password"]["patch"]
>[0];
