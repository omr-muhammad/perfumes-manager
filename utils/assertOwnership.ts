import { eq } from "drizzle-orm";
import { db } from "../db/config";
import { shopsTable, usersTable } from "../db/schema";

export async function assertIsOwner(userId: number) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) throw new Error("User not found");

  if (user.role !== "owner") throw new Error("Owner role required");

  return user;
}

export async function assertOwnership(shopId: number, ownerId: number) {
  const [shop] = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.id, shopId));

  if (!shop) throw new Error("Shop not found.");

  if (shop.ownerId !== ownerId)
    throw new Error(
      `Shop with id: ${shop.id} does not belong to user with id: ${ownerId}`,
    );

  return shop;
}
