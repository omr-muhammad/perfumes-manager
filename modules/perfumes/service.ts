import { and, eq } from "drizzle-orm";
import { db } from "../../db/config";
import { perfumesTable } from "../../db/schema/index";
import type {
  ApprovedPerfumeBody,
  CreateAdminPerfumeBody,
  UpdatePerfumeBody,
} from "./schema";

// Create Perfume
export async function create(name: string) {
  try {
    const [perfume] = await db
      .insert(perfumesTable)
      .values({
        name,
      })
      .returning();

    return perfume;
  } catch (e) {
    // Handle errors;
    // code === 23505 => duplicate
  }
}

export async function adminCreate(approvedPerfume: CreateAdminPerfumeBody) {
  const [perfume] = await db
    .insert(perfumesTable)
    .values({
      ...approvedPerfume,
      approved: true,
    })
    .returning();

  return perfume;
}

export async function adminApprove(id: number, perfume: ApprovedPerfumeBody) {
  try {
    const [approvedPerfume] = await db
      .update(perfumesTable)
      .set({
        ...perfume,
        approved: true,
        updatedAt: new Date(),
      })
      .where(and(eq(perfumesTable.id, id), eq(perfumesTable.approved, false)))
      .returning();

    return approvedPerfume;
  } catch (e) {
    // Handle errors;
  }
}

export async function queryAll(route?: "dashboard") {
  // 1) Admin and shops
  if (route === "dashboard") return await db.select().from(perfumesTable);

  // 2) Customers
  const perfumes = await db
    .select()
    .from(perfumesTable)
    .where(eq(perfumesTable.approved, true));

  return perfumes;
}

export async function update(id: number, updates: UpdatePerfumeBody) {
  try {
    const { name, sex, description, seasons } = updates;

    const [perfume] = await db
      .update(perfumesTable)
      .set({
        ...(name !== undefined && name !== "" && { name }),
        ...(sex !== undefined && { sex }),
        ...(description !== undefined && description !== "" && { description }),
        ...(seasons !== undefined && seasons.length >= 1 && { seasons }),
        updatedAt: new Date(),
      })
      .where(eq(perfumesTable.id, id))
      .returning();

    return perfume;
  } catch (e) {
    // Handler errors;
  }
}

export async function remove(id: number) {
  try {
    const [perfume] = await db
      .delete(perfumesTable)
      .where(eq(perfumesTable.id, id))
      .returning();

    return perfume || null;
  } catch (e) {
    // Handle errors;
  }
}
