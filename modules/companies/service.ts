import { and, eq } from "drizzle-orm";
import { db } from "../../db/config";
import { companiesTable } from "../../db/schema";
import type {
  CreateCompanyBody,
  ApproveCompnayBody,
  UpdateCompanyBody,
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
        updatedAt: new Date(),
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

export async function queryAll(withApproved?: boolean) {
  try {
    if (!withApproved) {
      return await db.select().from(companiesTable);
    }

    const companies = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.approved, true));

    return companies;
  } catch (e: any) {
    console.log("Error: ", e.cause);
  }
}

export async function update(id: number, updates: UpdateCompanyBody) {
  try {
    const [company] = await db
      .update(companiesTable)
      .set({ ...updates, updatedAt: new Date() })
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
