import { and, eq, ilike, sql } from "drizzle-orm";
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

export async function getById(ids: PfCompParams) {
  const [compound] = await db
    .select()
    .from(perfumeCompoundsTable)
    .where(eq(perfumeCompoundsTable.id, ids.compoundId));

  if (!compound)
    throw new AppError(
      404,
      `Perfume Compound with id: ${ids.compoundId} not found`,
    );

  return compound;
}

export async function getCompounds(query: QueryPfComp) {
  const queryFn =
    query.type === "perfume" ? getCompoundsByPerfume : getCompoundsByCompany;

  return unifyResult(await queryFn(query));
}
// -----------------------------------------------------------------

export type CompoundsByPerfume = Awaited<
  ReturnType<typeof getCompoundsByPerfume>
>;
export type CompoundsByCompany = Awaited<
  ReturnType<typeof getCompoundsByCompany>
>;
type UnionReturn = CompoundsByPerfume | CompoundsByCompany;

async function getCompoundsByPerfume({ search, page, limit }: QueryPfComp) {
  const offset = (page - 1) * limit;
  const results = await db.query.perfumesTable.findMany({
    columns: {
      id: true,
      name: true,
    },
    extras: {
      totalCount: sql<number>`count(*) over()`.as("total_count"),
    },
    where: ilike(perfumesTable.name, `%${search}%`),
    with: {
      compounds: {
        columns: {
          id: true,
        },
        with: {
          company: {
            columns: {
              id: true,
              name: true,
              hqCountryCode: true,
            },
          },
        },
      },
    },
    limit,
    offset,
  });

  // 2. Flatten
  const data = results.map((perfume) => ({
    id: perfume.id,
    name: perfume.name,
    pairings: perfume.compounds
      .filter((c) => c.company)
      .map((c) => ({
        compoundId: c.id,
        id: c.company.id,
        name: c.company.name,
        countryCode: c.company.hqCountryCode,
      })),
  }));

  const total = results[0]?.totalCount ?? 0;
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

async function getCompoundsByCompany({ search, page, limit }: QueryPfComp) {
  const offset = (page - 1) * limit;

  const results = await db.query.companiesTable.findMany({
    columns: {
      id: true,
      name: true,
      hqCountryCode: true,
    },
    extras: {
      totalCount: sql<number>`count(*) over()`.as("total_count"),
    },
    where: ilike(companiesTable.name, `%${search}%`),
    with: {
      compounds: {
        columns: {
          id: true,
        },
        with: {
          perfume: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    limit,
    offset,
  });

  // 2. Flatten into the required shape
  const data = results.map((company) => ({
    id: company.id,
    name: company.name,
    countryCode: company.hqCountryCode,
    pairings: company.compounds
      .filter((c) => c.perfume)
      .map((c) => ({
        compoundId: c.id,
        id: c.perfume.id,
        name: c.perfume.name,
      })),
  }));

  const total = results[0]?.totalCount ?? 0;
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

function unifyResult(result: UnionReturn) {
  const { data, pagination } = result;
  const unifiedPag = pagination as CompoundsByPerfume["pagination"];

  return {
    data: result.data.map((item) => ({
      id: item.id,
      name: item.name,
      countryCode: "countryCode" in item ? item.countryCode : undefined,
      pairings: item.pairings.map((p) => ({
        id: p.id,
        compoundId: p.compoundId,
        name: p.name,
        countryCode: "countryCode" in p ? p.countryCode : undefined,
      })),
    })),
    pagination: unifiedPag,
  };
}
