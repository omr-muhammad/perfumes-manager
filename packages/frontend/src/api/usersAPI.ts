import { backend } from "./client";

export type LoginCredentials = Parameters<
  typeof backend.api.users.login.post
>[0];
export type SignupUser = Parameters<typeof backend.api.users.signup.post>[0];

export async function apiLogin(credentials: LoginCredentials) {
  const { data, error } = await backend.api.users.login.post(credentials);

  if (error) throw new Error(error.value.message);

  return data.data;
}

export async function apiSignup(signupUser: SignupUser) {
  const { data, error } = await backend.api.users.signup.post(signupUser);

  if (error) throw new Error(error.value.message);

  return data.data;
}

export async function getLoggedUser() {
  const { data, error } = await backend.api.users.profile.get();

  if (error) throw new Error(error.value.message);

  return data.data;
}
