import { response } from "../../utils/response";
import type { AdminCreateUserBody } from "./schema";
import * as userService from "./service";

export async function adminCreateUser(context: { body: AdminCreateUserBody }) {
  const { body } = context;

  const user = await userService.adminCreate(body);

  return response.ok("User created", { id: user?.id, email: user?.email });
}
