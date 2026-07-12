import { redirect } from "react-router";
import { queryClient } from "../../lib/queryClient";
import { loggedUserQuery } from "./hooks";

export async function authLoader() {
  try {
    const user = await queryClient.fetchQuery(loggedUserQuery);

    if (!user) return redirect("/auth/login");

    const allowedRoles = ["admin", "owner"] as const;

    // @ts-expect-error - TS is DONKEY
    if (!allowedRoles.includes(user.role)) throw redirect("/auth/login");
  } catch {
    throw redirect("/auth/login");
  }
}
