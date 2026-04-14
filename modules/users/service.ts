import { eq } from "drizzle-orm";
import { db } from "../../db/config";
import { addressesTable, usersTable } from "../../db/schema";
import type {
  AdminCreateUserBody,
  SignupBody,
  LoginBody,
  UpdateUserBody,
} from "./schema";
import type { Address } from "../../utils/globalSchema";

// Admin
export async function adminCreate(newUser: AdminCreateUserBody) {
  try {
    const hashedPassword = await Bun.password.hash(newUser.user.password);

    const [user] = await db
      .insert(usersTable)
      .values({
        ...newUser.user,
        password: hashedPassword,
      })
      .returning();

    if (!user) return null;

    const { password, ...others } = user;

    if (!newUser.address) return others;

    const [address] = await db
      .insert(addressesTable)
      .values({
        ...newUser.address,
        userId: user.id,
      })
      .returning();

    if (!address) return others;

    return { ...others, address };
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

export async function getById(userId: number) {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

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

export async function upsertAddress(userId: number, address: Address) {
  try {
    const [userAddress] = await db
      .insert(addressesTable)
      .values({ ...address, userId })
      .onConflictDoUpdate({
        target: addressesTable.userId,
        set: { ...address, updatedAt: new Date() },
      })
      .returning();

    return userAddress;
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

export async function remove(userId: number, password?: string) {
  try {
    if (!password) {
      const [user] = await db
        .delete(usersTable)
        .where(eq(usersTable.id, userId))
        .returning();
      return user;
    }

    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) return null;

    const passwordMatch = await Bun.password.verify(password, user.password);

    if (!passwordMatch) return null;

    [user] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, userId))
      .returning();

    return user;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}
