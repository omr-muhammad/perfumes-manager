import { and, arrayContains, eq, ilike } from "drizzle-orm";
import { db } from "../../db/config";
import { perfumesTable } from "../../db/schema/index";
import type {
  DashboardQueryFilters,
  ApprovedPerfumeBody,
  CreateAdminPerfumeBody,
  PublicQueryFilters,
  Season,
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
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function adminCreate(approvedPerfume: CreateAdminPerfumeBody) {
  try {
    const [perfume] = await db
      .insert(perfumesTable)
      .values({
        ...approvedPerfume,
        approved: true,
      })
      .returning();

    return perfume;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
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
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function publicQuery(filters: PublicQueryFilters) {
  try {
    const conditions = prepareFilters(filters);
    const { page = 1, limit = 10 } = filters;

    const perfumes = await db
      .select()
      .from(perfumesTable)
      // .innerJoin()
      .where(and(...conditions, eq(perfumesTable.approved, true)))
      .offset((page - 1) * limit)
      .limit(limit);

    return perfumes;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function dashboardQuery(filters: DashboardQueryFilters) {
  try {
    const { page = 1, limit = 20 } = filters;
    const conditions = prepareFilters(filters);

    const perfumes = await db
      .select()
      .from(perfumesTable)
      .where(and(...conditions))
      .offset((page - 1) * limit)
      .limit(limit);

    return perfumes;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
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
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function remove(id: number) {
  try {
    const [perfume] = await db
      .delete(perfumesTable)
      .where(eq(perfumesTable.id, id))
      .returning();

    return perfume || null;
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

// HELPERS
function prepareFilters(filters: DashboardQueryFilters | PublicQueryFilters) {
  const {
    search,
    sex,
    seasons, // still separated comma string => winter,fall
  } = filters;

  const seasonsArray = seasons
    ? (seasons.split(",").map((s) => s.trim()) as Season[])
    : undefined;

  const conditions = [];

  if (sex) conditions.push(eq(perfumesTable.sex, sex));
  if (search) conditions.push(ilike(perfumesTable.name, `%${search}%`));
  if (seasonsArray?.length)
    conditions.push(arrayContains(perfumesTable.seasons, seasonsArray));

  if ("approved" in filters && filters.approved !== undefined)
    conditions.push(eq(perfumesTable.approved, filters.approved));

  return conditions;
}
