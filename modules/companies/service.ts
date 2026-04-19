import { and, eq, ilike } from "drizzle-orm";
import { db } from "../../db/config";
import { companiesTable } from "../../db/schema";
import type {
  CreateCompanyBody,
  ApproveCompnayBody,
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
  approvedComany: ApproveCompnayBody,
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
  try {
    const { page = 1, limit = 20 } = filters;
    const conditions = prepareCoFilters(filters);

    const companies = await db
      .select()
      .from(companiesTable)
      .where(and(...conditions))
      .offset((page - 1) * limit)
      .limit(limit);

    return companies;
  } catch (e: any) {
    console.log("Error: ", e.cause);
  }
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

// Helpers
function prepareCoFilters(filters: CompaniesQueryFilters) {
  const { name, country, type, approved } = filters;

  const conditions = [];

  if (name) conditions.push(ilike(companiesTable.name, `%${name}%`));
  if (country) conditions.push(ilike(companiesTable.country, `%${country}%`));
  if (type) conditions.push(eq(companiesTable.type, type));
  if (approved !== undefined)
    conditions.push(eq(companiesTable.approved, approved));

  return conditions;
}
