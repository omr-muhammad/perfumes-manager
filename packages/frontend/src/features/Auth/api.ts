import { backend } from "../../api/client";
import type { LoginCredentials, SignupUser } from "./types";

export async function apiGetLoggedUser() {
  const { data, error } = await backend.api.users.profile.get();

  if (error) throw new Error(error.value.message);

  return data.data?.user;
}

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

export async function apiLogout() {
  const { error } = await backend.api.users.profile.logout.post();

  if (error) throw new Error(error.value.message);
}
