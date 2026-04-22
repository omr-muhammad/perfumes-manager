import { eq, sql } from "drizzle-orm";
import { db } from "../../db/config";
import { addressesTable, usersTable } from "../../db/schema";
import type {
  AdminCreateUserBody,
  LoginBody,
  UpdateUserBody,
  SignupUser,
} from "./schema";
import type { Address } from "../../utils/globalSchema";
import { AppError } from "../../utils/AppError";

// Admin
export async function adminCreate(newUser: AdminCreateUserBody) {
  const hashedPassword = await Bun.password.hash(newUser.user.password);

  const [user] = await db
    .insert(usersTable)
    .values({
      ...newUser.user,
      password: hashedPassword,
    })
    .returning();

  if (!user) throw new AppError(400, "Cannot create new user.");

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
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) throw new AppError(404, `User with id: ${userId} not found.`);

  return user;
}

export async function handleActive(userId: number, active: boolean) {
  const [user] = await db
    .update(usersTable)
    .set({
      active,
    })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) throw new AppError(404, `User with id: ${userId} not found.`);

  return user;
}

// Logged Users
export async function update(userId: number, updates: UpdateUserBody) {
  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) throw new AppError(404, `User with id: ${userId} not found.`);

  return user;
}

export async function upsertAddress(userId: number, address: Address) {
  const [userAddress] = await db
    .insert(addressesTable)
    .values({ ...address, userId })
    .onConflictDoUpdate({
      target: addressesTable.userId,
      set: { ...address, updatedAt: new Date() },
    })
    .returning();

  if (!userAddress)
    throw new AppError(400, `Cannot create/update user address.`);

  return userAddress;
}

export async function ChangePassword(
  userId: number,
  oldPw: string,
  newPw: string,
) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) throw new AppError(404, `User with id: ${userId} not found.`);

  const isMatch = await Bun.password.verify(oldPw, user.password);

  if (!isMatch) throw new AppError(400, "Old password do not match.");

  const newHashed = await Bun.password.hash(newPw);
  const [updated] = await db
    .update(usersTable)
    .set({
      password: newHashed,
      tokenVersion: sql`${usersTable.tokenVersion} + 1`,
    })
    .returning();

  if (!updated)
    throw new AppError(
      400,
      `Failed to change password for user with id: ${userId}`,
    );

  return updated;
}

export async function signup(signupUser: SignupUser) {
  const hashedPassword = await Bun.password.hash(signupUser.password);
  signupUser.password = hashedPassword;

  const [user] = await db.insert(usersTable).values(signupUser).returning();

  if (!user) throw new AppError(400, "Cannot signup.");

  return user;
}

export async function login(loginData: LoginBody) {
  const { email, password } = loginData;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user)
    throw new AppError(400, "Failed to login email or password are invalid.");

  const pwMatch = await Bun.password.verify(password, user.password);

  if (!pwMatch)
    throw new AppError(400, "Failed to login email or password are invalid.");

  return user;
}

export async function remove(userId: number, password?: string) {
  if (!password) {
    const [user] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, userId))
      .returning();

    if (!user) throw new AppError(404, `User with id: ${userId} not found.`);

    return user;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) throw new AppError(404, `User with id: ${userId} not found.`);

  const passwordMatch = await Bun.password.verify(password, user.password);

  if (!passwordMatch) throw new AppError(400, "Invalid password.");

  const [deletedUser] = await db
    .delete(usersTable)
    .where(eq(usersTable.id, userId))
    .returning();

  if (!deletedUser)
    throw new AppError(
      400,
      "Failed to delete user, it may be already deleted.",
    );

  return user;
}
