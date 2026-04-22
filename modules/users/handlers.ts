import { response as res } from "../../utils/response";
import type { UserCTXs } from "./schema";
import * as usersService from "./service";
import { setCookie, signToken } from "../../utils/token";

// Admin
export async function adminCreateUser(context: UserCTXs["AdminCreate"]) {
  const { body } = context;

  const user = await usersService.adminCreate(body);

  if (!body.address)
    return res.ok("User created.", { id: user.id, email: user.email });

  if (!("address" in user))
    return res.ok(
      "User created successfully, but failed to add address data please insert again from profile page.",
      { id: user.id, email: user.email },
    );

  return res.ok("User created", {
    id: user.id,
    email: user.email,
    address: user.address,
  });
}

export async function getAllUsers() {
  const users = await usersService.queryAll();

  return res.ok("Users fetched", {
    users: users?.map(({ password, ...withoutPassword }) => withoutPassword),
  });
}

export async function getUserById(context: UserCTXs["AdminGetUser"]) {
  const { params } = context;

  const user = await usersService.getById(params.userId);

  const { password, ...withoutPassword } = user;
  return res.ok("User fetched", { user: withoutPassword });
}

export async function handleActivation(context: UserCTXs["Activation"]) {
  const { body, params } = context;

  const user = await usersService.handleActive(params.userId, body.active);

  const { password, ...withoutPw } = user;

  return res.ok("User updated.", { user: withoutPw });
}

export async function deleteUser(context: UserCTXs["AdminDel"]) {
  const { params } = context;

  const user = await usersService.remove(params.userId);

  return res.ok("User deleted", user && { id: user.id });
}

// Non Logged Users
export async function signup(context: UserCTXs["Signup"]) {
  const { body, authJWT, cookie } = context;

  const user = await usersService.signup(body.user);

  const { password, phone, role, ...safeInfo } = user;

  const token = await signToken(
    authJWT,
    { userId: user.id, role: user.role, tokenV: user.tokenVersion },
    body.keepLogin,
  );

  const maxAge = body.keepLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  setCookie(cookie, "authToken", token, maxAge);

  return res.ok("Signup Successfully", {
    user: safeInfo,
  });
}

export async function login(context: UserCTXs["Login"]) {
  const { body, authJWT, cookie } = context;

  const user = await usersService.login(body);

  const token = await signToken(
    authJWT,
    { userId: user.id, role: user.role, tokenV: user.tokenVersion },
    body.keepLogin,
  );

  const maxAge = body.keepLogin ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  setCookie(cookie, "authToken", token, maxAge);

  return res.ok("User logged");
}

// Logged Users
export async function logout(context: UserCTXs["Logout"]) {
  const { cookie } = context;

  cookie.authToken?.remove();
  // delete cookie.authToken;
  return res.ok("User logged out.");
}

export async function changePassword(context: UserCTXs["ChangePW"]) {
  const { body, authPayload, authJWT, cookie } = context;

  const user = await usersService.ChangePassword(
    authPayload.userId,
    body.oldPw,
    body.newPw,
  );

  const { password, role, phone, tokenVersion, ...safeInfo } = user;

  const token = await signToken(
    authJWT,
    { userId: user.id, role: user.role, tokenV: user.tokenVersion },
    true,
  );

  const maxAge = 30 * 24 * 60 * 60;
  setCookie(cookie, "authToken", token, maxAge);
  return res.ok("User Password updated.", { user: safeInfo });
}

export async function updateMe(context: UserCTXs["UpdateMe"]) {
  const { body, authPayload } = context;

  const user = await usersService.update(authPayload.userId, body);

  const { password, role, ...safeInfo } = user;
  return res.ok("User updated", { user: safeInfo });
}

export async function upsertUserAddress(context: UserCTXs["UpsertAddress"]) {
  const { authPayload, body } = context;

  const address = await usersService.upsertAddress(authPayload.userId, body);

  return res.ok("User Address added.", { address });
}

export async function getMe(context: UserCTXs["GetMe"]) {
  const { authPayload } = context;

  const user = await usersService.getById(authPayload.userId);

  const { password, ...safeInfo } = user;
  return res.ok("User fetched", { user: safeInfo });
}

export async function deleteMe(context: UserCTXs["DelMe"]) {
  const { body, authPayload } = context;

  const user = await usersService.remove(authPayload.userId, body.password);

  return res.ok("User delete", { userId: user });
}
