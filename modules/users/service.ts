import { and, eq } from "drizzle-orm";
import { db } from "../../db/config";
import { usersTable } from "../../db/schema";
import type {
  AdminCreateUserBody,
  SignupBody,
  AdminUpdateUserBody,
} from "./schema";
import {
  jwt,
  type JWTHeaderParameters,
  type JWTOption,
  type JWTPayloadInput,
  type JWTPayloadSpec,
} from "@elysiajs/jwt";
import type { AuthJWT } from "../../utils/jwtPlugins";

// try {

// } catch (e: any) {
//   console.log("Error: ", e.cause);
// }

// Admin
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

export async function adminUpdate(id: number, updates: AdminUpdateUserBody) {
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

// Non Admin
export async function ChangePassword(id: number, oldPw: string, newPw: string) {
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

export async function signup(jwt: AuthJWT, newUser: SignupBody) {
  try {
    const [user] = await db.insert(usersTable).values(newUser).returning();

    if (user) {
      const authToken = await jwt.sign({
        userId: user.id,
        role: user.role,
      });

      return { user, authToken };
    }

    return null;
  } catch (e: any) {
    console.log("Error: ", e.cause);
  }
}
