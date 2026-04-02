import { eq } from "drizzle-orm";
import { db } from "../../db/config";
import { companiesTable } from "../../db/schema";
import type {
  AdminCreateCompanyBody,
  ApproveCompnayBody,
  UpdateCompanyBody,
} from "./schema";

export async function create(name: string) {
  try {
    const [company] = await db
      .insert(companiesTable)
      .values({
        name,
      })
      .returning();

    return company;
  } catch (e) {
    console.log("Error: ", e);
  }
}

export async function adminCreate(newCompany: AdminCreateCompanyBody) {
  try {
    const [company] = await db
      .insert(companiesTable)
      .values({
        ...newCompany,
        approved: true,
      })
      .returning();

    return company;
  } catch (e) {
    console.log("Error: ", e);
  }
}

export async function approve(id: number, approvedComany: ApproveCompnayBody) {
  try {
    const [company] = await db
      .update(companiesTable)
      .set({
        ...approvedComany,
        approved: true,
      })
      .where(eq(companiesTable.id, id))
      .returning();

    return company;
  } catch (e: any) {
    console.dir(e.cause);
  }
}

export async function queryAll(route?: "dashboard") {
  try {
    if (route === "dashboard") {
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
