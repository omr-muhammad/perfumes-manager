import { and, eq, ilike } from "drizzle-orm";
import { db } from "../../db/config";
import {
  companiesTable,
  perfumeCompoundsTable,
  perfumesTable,
} from "../../db/schema";
import { AppError } from "../../utils/AppError";
import type {
  CreatePfComp,
  PfCompParams,
  QueryPfComp,
  UpdatePfComp,
} from "./schema";

export async function create(values: CreatePfComp) {
  const { density, ...rest } = values;

  const [pfComp] = await db
    .insert(perfumeCompoundsTable)
    .values({
      ...rest,
      ...(density && { density: density.toFixed(3) }),
    })
    .returning();

  if (!pfComp) throw new AppError(400, `Cannot create perfume compound.`);

  return pfComp;
}

export async function update(ids: PfCompParams, updates: UpdatePfComp) {
  const { density, ...rest } = updates;

  const [pfComp] = await db
    .update(perfumeCompoundsTable)
    .set({
      ...rest,
      ...(density && { density: density.toFixed(3) }),
    })
    .where(eq(perfumeCompoundsTable.id, ids.compoundId))
    .returning();

  if (!pfComp) throw new AppError(400, `Cannot create perfume compound.`);

  return pfComp;
}

export async function remove(ids: PfCompParams) {
  const [pfComp] = await db
    .delete(perfumeCompoundsTable)
    .where(eq(perfumeCompoundsTable.id, ids.compoundId))
    .returning();

  if (!pfComp) throw new AppError(400, `Cannot create perfume compound.`);

  return pfComp;
}

// export async function query(query: QueryPfComp) {
//   const conditions = prepareQuery(query);

//   const queryies = await db.query.perfumeCompoundsTable.findMany({
//     with: {
//       perfumes: true,
//       companies: true
//     }
//   })

//   const comps = await db
//     .select()
//     .from(perfumeCompoundsTable)
//     .innerJoin(
//       perfumesTable,
//       eq(perfumesTable.id, perfumeCompoundsTable.perfumeId),
//     )
//     .innerJoin(
//       companiesTable,
//       eq(companiesTable.id, perfumeCompoundsTable.companyId),
//     )
//     .where(and(...conditions));

//     return comps.map(c => ({ compoundName: `${c.perfumes.name} - ${c.companies.name}`, density: c.perfumes_compounds.density }))
// }

// -----------------------------------------------------------------

// function prepareQuery(query: QueryPfComp) {
//   const conditions = [];
//   if (query.perfumeName)
//     conditions.push(ilike(perfumesTable.name, query.perfumeName));
//   if (query.companyName)
//     conditions.push(ilike(companiesTable.name, query.companyName));

//   return conditions;
// }
