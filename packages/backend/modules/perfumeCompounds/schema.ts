import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { perfumeCompoundsTable } from "../../db/schema";
import { t, type Static } from "elysia";
import {
  ID,
  QueriesMeta,
  TrimmedString,
  type Ctx,
} from "../../utils/globalSchema";

const PerfumeCompoundCreateSchema = createInsertSchema(perfumeCompoundsTable, {
  density: t.Optional(TrimmedString("density")),
});

// ---------------- Create Perfume Compound ----------------
const CreatePfComp = t.Omit(PerfumeCompoundCreateSchema, [
  "createdAt",
  "updatedAt",
]);
export type CreatePfComp = Static<typeof CreatePfComp>;

// ---------------- Update Perfume Compound ----------------
const UpdatePfComp = t.Partial(CreatePfComp);
export type UpdatePfComp = Static<typeof UpdatePfComp>;

// ---------------- Query Perfume Compound ----------------
const QueryPfComp = t.Object({
  type: t.Union([t.Literal("perfume"), t.Literal("company")]),
  search: TrimmedString("search"),
  ...QueriesMeta,
});

export type QueryPfComp = Static<typeof QueryPfComp>;

const UnpairedQuery = t.Object({
  search: TrimmedString("search"),
  mateId: t.Optional(t.Numeric()),
  type: t.Union([t.Literal("perfume"), t.Literal("company")]),
});

export type UnpairedQuery = Static<typeof UnpairedQuery>;
// ---------------- Perfume Compound Params ----------------
const PfCompParams = t.Object({ compoundId: ID });
export type PfCompParams = Static<typeof PfCompParams>;

// ---------------- Perfume Compound CTXs ----------------
export interface PfCompCtxs {
  create: Ctx<CreatePfComp, unknown>;
  update: Ctx<UpdatePfComp, PfCompParams>;
  delete: Ctx<unknown, PfCompParams>;
  query: Ctx<unknown, unknown, QueryPfComp>;
  queryOne: Ctx<unknown, PfCompParams>;
  queryUnpaired: Ctx<unknown, unknown, UnpairedQuery>;
}

// ---------------- Perfume Compound Schema ----------------
export const PfCompSchema = {
  create: {
    body: CreatePfComp,
    detail: {
      summary: "Create a perfume compound catalog entry",
      tags: ["Perfume Compounds"],
    },
  },
  update: {
    body: UpdatePfComp,
    params: PfCompParams,
    detail: {
      summary: "Update a perfume compound catalog entry",
      tags: ["Admin - Compounds"],
    },
  },
  delete: {
    params: PfCompParams,
    detail: {
      summary: "Delete a perfume compound catalog entry",
      tags: ["Admin - Compounds"],
    },
  },
  query: {
    query: QueryPfComp,
    detail: {
      summary: "Query perfumes compounds and group by perfume or company",
      tags: ["Perfume Compounds"],
    },
  },
  queryUnpaired: {
    query: UnpairedQuery,
    detail: {
      summary: "Query perfumes compounds with paired state of passed mate id",
      tags: ["Perfume Compounds"],
    },
  },
  queryOne: {
    params: PfCompParams,
    detail: {
      summary: "Get perfume compound by id",
      tags: ["Perfume Compounds"],
    },
  },
};
