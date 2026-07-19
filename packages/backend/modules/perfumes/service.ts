import {
  and,
  arrayContains,
  eq,
  getTableColumns,
  ilike,
  sql,
} from "drizzle-orm";
import { db } from "../../db/config";
import { perfumesTable } from "../../db/schema/index";
import type {
  CreatePerfumeBody,
  QueryPerfumes,
  Season,
  UpdatePerfumeBody,
} from "./schema";
import { AppError } from "../../utils/AppError";

export async function create(
  newPerfume: CreatePerfumeBody,
  approved?: boolean,
) {
  const [perfume] = await db
    .insert(perfumesTable)
    .values({ ...newPerfume, approved })
    .returning();

  if (!perfume) throw new AppError(400, "Cannot create new perfume.");

  return perfume;
}

export async function adminApprove(
  perfumeId: number,
  perfume: UpdatePerfumeBody,
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

export async function query(filters: QueryPerfumes) {
  try {
    const conditions = preparePerfumesFilters(filters);
    const { page = 1, limit = 10 } = filters;

    const rows = await db
      .select({
        ...getTableColumns(perfumesTable),
        totalCount: sql<number>`count(*) over()`.as("total_count"),
      })
      .from(perfumesTable)
      .where(and(...conditions, eq(perfumesTable.approved, true)))
      .offset((page - 1) * limit)
      .limit(limit);

    const total = rows[0]?.totalCount ?? 0;
    const data = rows.map(({ totalCount, ...row }) => row);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  } catch (e: any) {
    console.log("Error: ", e);
    console.log("Error Cause: ", e.cause);
    throw e;
  }
}

export async function update(perfumeId: number, updates: UpdatePerfumeBody) {
  const [perfume] = await db
    .update(perfumesTable)
    .set(updates)
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
function preparePerfumesFilters(filters: QueryPerfumes) {
  const { search, sex, seasons, approved } = filters;

  const conditions = [];

  if (sex) conditions.push(eq(perfumesTable.sex, sex));
  if (search) conditions.push(ilike(perfumesTable.name, `%${search}%`));
  if (seasons?.length)
    conditions.push(arrayContains(perfumesTable.seasons, seasons));

  if (approved !== undefined)
    conditions.push(eq(perfumesTable.approved, filters.approved || true));

  return conditions;
}
