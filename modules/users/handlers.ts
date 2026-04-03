import { response as res } from "../../utils/response";
import type { AdminCreateUserBody, UpdateUserBody } from "./schema";
import * as usersService from "./service";

export async function adminCreateUser(context: { body: AdminCreateUserBody }) {
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

export async function getUserById(context: { params: { id: number } }) {
  const { params } = context;

  const user = await usersService.getById(params.id);

  if (user) {
    const { password, ...withoutPassword } = user;
    return res.ok("User fetched", { user: withoutPassword });
  }

  return res.fail("Uesr not found", { code: "NOT_FOUND" });
}

export async function updateUser(context: {
  params: { id: number };
  body: UpdateUserBody;
}) {
  const { params, body } = context;

  const user = await usersService.update(params.id, body);

  if (user) {
    const { password, ...withoutPw } = user;
    return res.ok("User updated", { user: withoutPw });
  }

  return res.fail("User not found", { code: "NOT_FOUND" });
}
