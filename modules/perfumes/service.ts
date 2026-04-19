import { and, arrayContains, eq, ilike } from "drizzle-orm";
import { db } from "../../db/config";
import { perfumesTable } from "../../db/schema/index";
import {
  type DashboardQueryFilters,
  ApprovedPerfumeBody,
  type CreateAdminPerfumeBody,
  type PublicQueryFilters,
  type Season,
  type UpdatePerfumeBody,
} from "./schema";
import { AppError } from "../../utils/AppError";

// Create Perfume
export async function create(name: string) {
  const [perfume] = await db
    .insert(perfumesTable)
    .values({
      name,
    })
    .returning();

  if (!perfume) throw new AppError(400, "Cannot create new perfume.");

  return perfume;
}

export async function adminCreate(approvedPerfume: CreateAdminPerfumeBody) {
  const [perfume] = await db
    .insert(perfumesTable)
    .values({
      ...approvedPerfume,
      approved: true,
    })
    .returning();

  if (!perfume) throw new AppError(400, "Cannot create new perfume.");

  return perfume;
}

export async function adminApprove(
  perfumeId: number,
  perfume: ApprovedPerfumeBody,
) {
  const [approvedPerfume] = await db
    .update(perfumesTable)
    .set({
      ...perfume,
      approved: true,
    })
    .where(
      and(eq(perfumesTable.id, perfumeId), eq(perfumesTable.approved, false)),
    )
    .returning();

  if (!approvedPerfume)
    throw new AppError(
      404,
      `Perfume with id: ${perfumeId} not found or already approved`,
    );

  return approvedPerfume;
}

export async function publicQuery(filters: PublicQueryFilters) {
  try {
    const conditions = preparePerfumesFilters(filters);
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
    const conditions = preparePerfumesFilters(filters);

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

export async function update(perfumeId: number, updates: UpdatePerfumeBody) {
  const { name, sex, description, seasons } = updates;

  const [perfume] = await db
    .update(perfumesTable)
    .set({
      ...(name !== undefined && name !== "" && { name }),
      ...(sex !== undefined && { sex }),
      ...(description !== undefined && description !== "" && { description }),
      ...(seasons !== undefined && seasons.length >= 1 && { seasons }),
    })
    .where(eq(perfumesTable.id, perfumeId))
    .returning();

  if (!perfume)
    throw new AppError(404, `Perfuem with id: ${perfumeId} not found.`);

  return perfume;
}

export async function remove(perfumeId: number) {
  const [perfume] = await db
    .delete(perfumesTable)
    .where(eq(perfumesTable.id, perfumeId))
    .returning();

  if (!perfume)
    throw new AppError(404, `Perfume with id: ${perfumeId} not found`);

  return perfume;
}

// HELPERS
function preparePerfumesFilters(
  filters: DashboardQueryFilters | PublicQueryFilters,
) {
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
