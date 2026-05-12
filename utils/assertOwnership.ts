import { eq } from "drizzle-orm";
import { db } from "../db/config";
import { shopsTable, usersTable } from "../db/schema";
import { AppError } from "./AppError";

export async function assertIsOwner(userId: number) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) throw new AppError(404, "User not found");

  if (user.role !== "owner") throw new AppError(403, "Owner role required");

  return user;
}

export async function assertOwnership(shopId: number, ownerId: number) {
  const [shop] = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.id, shopId));

  if (!shop) throw new AppError(404, "Shop not found.");

  if (shop.ownerId !== ownerId)
    throw new AppError(
      403,
      `Shop with id: ${shop.id} does not belong to user with id: ${ownerId}`,
    );

  return shop;
}
