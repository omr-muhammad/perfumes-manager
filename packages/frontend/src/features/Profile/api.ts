import { backend } from "@/api/client";
import type { UpdatePassword, UserUpdates } from "./types";

export async function updateProfile(updates: UserUpdates) {
  const { data, error } = await backend.api.users.profile.patch(updates);

  if (error || !data.success)
    throw new Error(error?.value.message ?? data?.message);

  return data.data!.user;
}

export async function updateUserPassword(newCredentials: UpdatePassword) {
  const { data, error } =
    await backend.api.users.profile["change-password"].patch(newCredentials);

  if (error || !data.success)
    throw new Error(error?.value.message ?? data?.message);

  return data.data!.user;
}
