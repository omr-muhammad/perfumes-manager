import type { backend } from "../../api/client";

export type LoginCredentials = Parameters<
  typeof backend.api.users.login.post
>[0];
export type SignupUser = Parameters<typeof backend.api.users.signup.post>[0];
