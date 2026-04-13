import { eq } from "drizzle-orm";
import { db } from "../../db/config";
import { usersTable } from "../../db/schema";
import type {
  AdminCreateUserBody,
  SignupBody,
  AdminUpdateUserBody,
  LoginBody,
  UpdateUserBody,
} from "./schema";

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
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function queryAll() {
  try {
    const users = await db.select().from(usersTable);

    return users;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
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
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
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
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function handleActive(userId: number, active: boolean) {
  try {
    const [user] = await db
      .update(usersTable)
      .set({
        active,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId))
      .returning();

    return user;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

// Logged Users
export async function update(id: number, updates: UpdateUserBody) {
  try {
    const [user] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, id))
      .returning();

    return user;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

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
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function signup(newUser: SignupBody) {
  try {
    const hashedPassword = await Bun.password.hash(newUser.password);
    newUser.password = hashedPassword;

    const [user] = await db.insert(usersTable).values(newUser).returning();

    return user;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function login(loginData: LoginBody) {
  try {
    const { email, password, keepLogin } = loginData;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user) return null;

    const pwMatch = await Bun.password.verify(password, user.password);

    if (!pwMatch) return null;

    return user;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function remove(id: number, password?: string) {
  try {
    if (!password)
      return await db
        .delete(usersTable)
        .where(eq(usersTable.id, id))
        .returning({ id: usersTable.id });

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user) return -1;

    const passwordMatch = await Bun.password.verify(password, user.password);

    if (!passwordMatch) return null;

    return await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}
