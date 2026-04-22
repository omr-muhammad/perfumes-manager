import { t, type Static } from "elysia";
import { ID, QueriesMeta, type Ctx } from "../../utils/globalSchema";
import { createInsertSchema } from "drizzle-typebox";
import { perfumesTable } from "../../db/schema";

// ---------------- Globals ----------------
const PerfumeSchema = createInsertSchema(perfumesTable);
const PerfumeSex = t.Union(
  [t.Literal("men"), t.Literal("women"), t.Literal("unisex")],
  { error: "Perfume sex must be one of (men | women | unisex)." },
);
export type Season = "winter" | "summer" | "fall" | "spring";

// ---------------- Create ----------------
export const CreatePerfumeBody = t.Omit(PerfumeSchema, [
  "approved",
  "createdAt",
  "updatedAt",
]);
export type CreatePerfumeBody = Static<typeof CreatePerfumeBody>;

// ---------------- Update (admin) ----------------
export const UpdatePerfumeBody = t.Partial(CreatePerfumeBody);
export type UpdatePerfumeBody = Static<typeof UpdatePerfumeBody>;

// ---------------- Query ----------------
export const QueryPerfumesFilters = t.Partial(
  t.Object({
    search: t.String({ minLength: 1 }),
    sex: PerfumeSex,
    seasons: t.String(),
    approved: t.BooleanString(),
    ...QueriesMeta,
  }),
);
export type QueryPerfumesFilters = Static<typeof QueryPerfumesFilters>;

// ---------------- URL Params ----------------
export const PfParams = t.Object({ perfumeId: ID });
export type PfParams = Static<typeof PfParams>;

// ---------------- Contexts Types ----------------
export interface PerfumesCTXs {
  CreatePfCtx: Ctx<CreatePerfumeBody>;
  QueryPfCtx: Ctx<unknown, unknown, QueryPerfumesFilters>;
  ApprovePfCtx: Ctx<UpdatePerfumeBody, PfParams>;
  UpdatePfCtx: Ctx<UpdatePerfumeBody, PfParams>;
  DelPfCtx: Ctx<unknown, PfParams>;
}
// ---------------- Contexts Schema ----------------
export const ContextSchema = {
  QueryPf: { query: QueryPerfumesFilters },
  CreatePf: { body: CreatePerfumeBody },
  ApprovePf: { params: PfParams, body: UpdatePerfumeBody },
  UpdatePf: { params: PfParams, body: UpdatePerfumeBody },
  DelPf: { params: PfParams },
};
