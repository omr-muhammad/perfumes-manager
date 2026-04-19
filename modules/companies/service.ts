import { and, eq, ilike } from "drizzle-orm";
import { db } from "../../db/config";
import { companiesTable } from "../../db/schema";
import type {
  CreateCompanyBody,
  ApproveCompnayBody,
  UpdateCompanyBody,
  CompaniesQueryFilters,
} from "./schema";

export async function create(companyBody: CreateCompanyBody, approve: boolean) {
  try {
    const [company] = await db
      .insert(companiesTable)
      .values({
        ...companyBody,
        ...(approve && { approved: true }),
      })
      .returning();

    return company;
  } catch (e) {
    console.log("Error: ", e);
  }
}

export async function approve(
  companyId: number,
  approvedComany: ApproveCompnayBody,
) {
  try {
    const [company] = await db
      .update(companiesTable)
      .set({
        ...approvedComany,
        approved: true,
      })
      .where(
        and(
          eq(companiesTable.id, companyId),
          eq(companiesTable.approved, false),
        ),
      )
      .returning();

    return company;
  } catch (e: any) {
    console.dir(e.cause);
  }
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

export async function update(id: number, updates: UpdateCompanyBody) {
  try {
    const [company] = await db
      .update(companiesTable)
      .set(updates)
      .where(eq(companiesTable.id, id))
      .returning();

    return company;
  } catch (e: any) {
    console.log("Error: ", e.cause);
  }
}

export async function remove(id: number) {
  try {
    const [company] = await db
      .delete(companiesTable)
      .where(eq(companiesTable.id, id))
      .returning();

    return company || null;
  } catch (e: any) {
    console.log("Error: ", e.cause);
  }
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
