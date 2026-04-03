import { db } from "../../db/config";
import { usersTable } from "../../db/schema";
import type { AdminCreateUserBody } from "./schema";

// try {

// } catch (e: any) {
//   console.log("Error: ", e.cause);
// }

export async function adminCreate(newUser: AdminCreateUserBody) {
  try {
    const hashedPassword = await Bun.password.hash(newUser.password);

    const [user] = await db
      .insert(usersTable)
      .values({
        ...newUser,
        password: hashedPassword,
      })
      .returning();

    if (user) {
      const { password, ...others } = user;

      return others;
    }

    return null;
  } catch (e: any) {
    console.log("Error: ", e.cause);
  }
}
