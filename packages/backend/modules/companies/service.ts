import { and, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { db } from "../../db/config";
import { companiesTable } from "../../db/schema";
import type {
  CreateCompanyBody,
  UpdateCompanyBody,
  CompaniesQueryFilters,
} from "./schema";
import { AppError } from "../../utils/AppError";

export async function create(companyBody: CreateCompanyBody, approve: boolean) {
  const [company] = await db
    .insert(companiesTable)
    .values({
      ...companyBody,
      ...(approve && { approved: true }),
    })
    .returning();

  if (!company) throw new AppError(400, "Cannot create new company.");

  return company;
}

export async function approve(
  companyId: number,
  approvedComany: UpdateCompanyBody,
) {
  const [company] = await db
    .update(companiesTable)
    .set({
      ...approvedComany,
      approved: true,
    })
    .where(
      and(eq(companiesTable.id, companyId), eq(companiesTable.approved, false)),
    )
    .returning();

  if (!company)
    throw new AppError(
      400,
      `Company with id: ${companyId} does not exist or already approved.`,
    );

  return company;
}

export async function queryAll(filters: CompaniesQueryFilters) {
  const { page = 1, limit = 20 } = filters;
  const conditions = prepareCoFilters(filters);

  const rows = await db
    .select({
      ...getTableColumns(companiesTable),
      totalCount: sql<number>`count(*) over()`.as("total_count"),
    })
    .from(companiesTable)
    .where(and(...conditions))
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
}

export async function getCoById(coId: number) {
  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, coId));

  if (!company) throw new AppError(404, `Company with id: ${coId} not found.`);

  return company;
}

export async function update(companyId: number, updates: UpdateCompanyBody) {
  const [company] = await db
    .update(companiesTable)
    .set(updates)
    .where(eq(companiesTable.id, companyId))
    .returning();

  if (!company)
    throw new AppError(404, `Company with id: ${companyId} does not exist.`);

  return company;
}

export async function remove(companyId: number) {
  const [company] = await db
    .delete(companiesTable)
    .where(eq(companiesTable.id, companyId))
    .returning();

  if (!company)
    throw new AppError(404, `Company with id: ${companyId} does not exist.`);

  return company;
}

// ------------- Helpers -------------
function prepareCoFilters(filters: CompaniesQueryFilters) {
  const { search, type, approved } = filters;

  const conditions = [];

  if (search) conditions.push(ilike(companiesTable.name, `%${search}%`));
  if (type) conditions.push(eq(companiesTable.type, type));
  if (approved !== undefined)
    conditions.push(eq(companiesTable.approved, approved));

  return conditions;
}
