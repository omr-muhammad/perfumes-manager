import type { Cookie } from "elysia";
import type { AuthJWT } from "../../utils/jwtPlugins";
import { response as res } from "../../utils/response";
import type {
  AdminCreateUserBody,
  SignupBody,
  ChangePasswordBody,
  AdminUpdateUserBody,
} from "./schema";
import * as usersService from "./service";

// Ctx for context;
type Ctx<TBody = unknown, TParams = unknown> = {
  authJWT: AuthJWT;
  body: TBody;
  params: TParams;
  cookie: Record<string, Cookie<unknown>>;
};

type TParams = { id: number };

// Admin
export async function adminCreateUser(context: Ctx<AdminCreateUserBody>) {
  const { body } = context;

  const user = await usersService.adminCreate(body);

  return res.ok("User created", { id: user?.id, email: user?.email });
}

export async function getAllUsers() {
  const users = await usersService.queryAll();

  return res.ok("Users fetched", {
    users: users?.map(({ password, ...withoutPassword }) => withoutPassword),
  });
}

export async function getUserById(context: Ctx<unknown, TParams>) {
  const { params } = context;

  const user = await usersService.getById(params.id);

  if (user) {
    const { password, ...withoutPassword } = user;
    return res.ok("User fetched", { user: withoutPassword });
  }

  return res.fail("Uesr not found", { code: "NOT_FOUND" });
}

export async function adminUpdateUser(
  context: Ctx<AdminUpdateUserBody, TParams>,
) {
  const { params, body } = context;

  const user = await usersService.adminUpdate(params.id, body);

  if (user) {
    const { password, ...withoutPw } = user;
    return res.ok("User updated", { user: withoutPw });
  }

  return res.fail("User not found", { code: "NOT_FOUND" });
}

// Non Admin
export async function changePassword(
  context: Ctx<ChangePasswordBody, TParams>,
) {
  const { params, body } = context;

  const user = await usersService.ChangePassword(
    params.id,
    body.oldPw,
    body.newPw,
  );

  if (user) {
    const { password, ...withoutPw } = user;
    return res.ok("User Password updated.", { user: withoutPw });
  }

  return res.fail("User not found or old password is wrong", {
    code: "NOT_FOUND",
  });
}

export async function signup(context: Ctx<SignupBody>) {
  const { body, authJWT, cookie } = context;

  const result = await usersService.signup(authJWT, body);

  if (!result) return res.fail("Uknown Error", { code: "UNKNOWN" });

  const { password, phone, role, ...safeUser } = result.user;

  const inProduction = process.env.NODE_ENV === "production";
  cookie.authToken?.set({
    value: result.authToken,
    secrets: process.env.jwt_secret,
    httpOnly: inProduction, // true => client cannot access with document.cookie
    maxAge: body.keepLoggedIn ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 7 days or One
    secure: inProduction, // true => only send with https
  });

  return res.ok("Signup Successfully", {
    user: safeUser,
    token: result.authToken,
  });
}
