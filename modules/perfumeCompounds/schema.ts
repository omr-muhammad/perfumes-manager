import { createSelectSchema } from "drizzle-typebox";
import { perfumeCompoundsTable } from "../../db/schema";
import { t, type Static } from "elysia";
import { ID, type Ctx } from "../../utils/globalSchema";

const PerfumeCompoundCreateSchema = createSelectSchema(perfumeCompoundsTable, {
  density: t.Optional(t.Number()),
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
const QueryPfComp = t.Partial(
  t.Object({
    perfumeName: t.String(),
    companyName: t.String(),
  }),
);
export type QueryPfComp = Static<typeof QueryPfComp>;

// ---------------- Perfume Compound Params ----------------
const PfCompParams = t.Object({ compoundId: ID });
export type PfCompParams = Static<typeof PfCompParams>;

// ---------------- Perfume Compound CTXs ----------------
export interface PfCompCtxs {
  create: Ctx<CreatePfComp, unknown>;
  update: Ctx<UpdatePfComp, PfCompParams>;
  delete: Ctx<unknown, PfCompParams>;
  query: Ctx<unknown, unknown, QueryPfComp>;
}

// ---------------- Perfume Compound Schema ----------------
export const PfCompSchema = {
  create: { body: CreatePfComp },
  update: { body: UpdatePfComp, params: PfCompParams },
  delete: { params: PfCompParams },
  query: { query: QueryPfComp },
};
