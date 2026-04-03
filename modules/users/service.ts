import { and, eq } from "drizzle-orm";
import { db } from "../../db/config";
import { usersTable } from "../../db/schema";
import type { AdminCreateUserBody, UpdateUserBody } from "./schema";

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

export async function queryAll() {
  try {
    const users = await db.select().from(usersTable);

    return users;
  } catch (e: any) {
    console.log("Error: ", e.cause);
  }
}

export async function getById(id: number) {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    return user;
  } catch (e: any) {
    console.log("Error: ", e.cause);
  }
}

export async function update(id: number, updates: UpdateUserBody) {
  try {
    if (updates.password)
      updates.password = await Bun.password.hash(updates.password);

    const [user] = await db
      .update(usersTable)
      .set({ ...updates, createdAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();

    return user;
  } catch (e: any) {
    console.log("Error: ", e.cause);
  }
}

export async function updatePassword(id: number, oldPw: string, newPw: string) {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user) return null;

    const isMatch = await Bun.password.verify(oldPw, user.password);

    if (!isMatch) return null;

    const newHashed = await Bun.password.hash(newPw);
    const [updated] = await db
      .update(usersTable)
      .set({ password: newHashed, updatedAt: new Date() })
      .returning();

    return updated;
  } catch (e: any) {
    console.log("Error: ", e.cause);
  }
}
