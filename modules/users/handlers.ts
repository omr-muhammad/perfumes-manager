import { response as res } from "../../utils/response";
import type {
  AdminCreateUserBody,
  SignupBody,
  ChangePasswordBody,
  LoginBody,
  UpdateUserBody,
  HandleActiveBody,
} from "./schema";
import * as usersService from "./service";
import type {
  Ctx,
  CtxWithoutPayload,
  UserParams,
} from "../../utils/globalSchema";
import { setCookie, signToken } from "../../utils/token";

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

export async function getUserById(context: Ctx<unknown, UserParams>) {
  const { params } = context;

  const user = await usersService.getById(params.userId);

  if (!user) return res.fail("Uesr not found", { code: "NOT_FOUND" });

  const { password, ...withoutPassword } = user;
  return res.ok("User fetched", { user: withoutPassword });
}

export async function handleActivation(
  context: Ctx<HandleActiveBody, UserParams>,
) {
  const { body, params } = context;

  const user = await usersService.handleActive(params.userId, body.active);

  if (!user) return res.fail("User not found.", { code: "NOT_FOUND" });

  const { password, ...withoutPw } = user;

  return res.ok("User updated.", { user: withoutPw });
}

// Logged Users
export async function changePassword(context: Ctx<ChangePasswordBody>) {
  const { body, authPayload } = context;

  const user = await usersService.ChangePassword(
    authPayload.userId,
    body.oldPw,
    body.newPw,
  );

  if (!user)
    return res.fail("User not found or old password is wrong", {
      code: "NOT_FOUND",
    });

  const { password, role, phone, ...safeInfo } = user;
  return res.ok("User Password updated.", { user: safeInfo });
}

export async function signup(context: CtxWithoutPayload<SignupBody>) {
  const { body, authJWT, cookie } = context;

  const user = await usersService.signup(body);

  if (!user) return res.fail("Fail to Signup", { code: "FAIL_SIGNUP" });

  const { password, phone, role, ...safeInfo } = user;

  const token = await signToken(
    authJWT,
    { userId: user.id, role: user.role },
    body.keepLogin,
  );

  const maxAge = body.keepLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  setCookie(cookie, "authToken", token, maxAge);

  return res.ok("Signup Successfully", {
    user: safeInfo,
  });
}

export async function login(context: CtxWithoutPayload<LoginBody>) {
  const { body, authJWT, cookie } = context;

  const user = await usersService.login(body);

  if (!user)
    return res.fail("Invalid email or password.", {
      code: "INVALID_CREDENTIALS",
    });

  const token = await signToken(
    authJWT,
    { userId: user.id, role: user.role },
    body.keepLogin,
  );

  const maxAge = body.keepLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  setCookie(cookie, "authToken", token, maxAge);

  return res.ok("User logged");
}

export async function updateMe(context: Ctx<UpdateUserBody>) {
  const { body, authPayload } = context;

  const user = await usersService.update(authPayload.userId, body);

  if (!user) return res.fail("User not found", { code: "NOT_FOUND" });

  const { password, role, ...safeInfo } = user;
  return res.ok("User updated", { user: safeInfo });
}

export async function getMe(context: Ctx) {
  const { authPayload } = context;

  const user = await usersService.getById(authPayload.userId);

  if (!user) return res.fail("User not found", { code: "NOT_FOUND" });

  const { password, ...safeInfo } = user;
  return res.ok("User fetched", { user: safeInfo });
}

export async function deleteUser(context: Ctx<unknown, UserParams>) {
  const { params } = context;

  const user = await usersService.remove(params.userId);

  return res.ok("User deleted");
}

export async function deleteMe(context: Ctx<{ password: string }>) {
  const { body, authPayload } = context;

  const user = await usersService.remove(authPayload.userId, body.password);

  if (!user)
    return res.fail("Cannot delete account, invalid password", {
      code: "INVALID_CREDENTIALS",
    });

  return res.ok("User delete", { userId: user });
}
