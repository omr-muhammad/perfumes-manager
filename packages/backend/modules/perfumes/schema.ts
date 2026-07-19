import { t, type Static } from "elysia";
import { ID, QueriesMeta, type Ctx } from "../../utils/globalSchema";
import { createInsertSchema } from "drizzle-typebox";
import { perfumesTable } from "../../db/schema";
import { enumToUnion } from "../../utils/unionToLiteral";
import { seasonsEn, sexEn } from "../../db/schema/enums";
import z from "zod";

// ---------------- Globals ----------------
const PerfumeSchema = createInsertSchema(perfumesTable);
const Sex = z.enum(sexEn.enumValues, {
  error: `Perfume sex must be one of (${sexEn.enumValues.join(", ")}).`,
});
const Season = z.enum(seasonsEn.enumValues, {
  error: `Seasons must be one or more of (${seasonsEn.enumValues.join(", ")})`,
});
export type Season = "winter" | "summer" | "fall" | "spring";

// ---------------- Create ----------------
const CreatePerfumeBody = t.Omit(PerfumeSchema, [
  "approved",
  "createdAt",
  "updatedAt",
]);
export type CreatePerfumeBody = Static<typeof CreatePerfumeBody>;

// ---------------- Update (admin) ----------------
const UpdatePerfumeBody = t.Partial(CreatePerfumeBody);
export type UpdatePerfumeBody = Static<typeof UpdatePerfumeBody>;

// ---------------- Query ----------------
const QueryPerfumes = z
  .object({
    search: z.string(),
    sex: Sex,
    seasons: z.preprocess(
      (val) =>
        val === undefined ? undefined : Array.isArray(val) ? val : [val],
      z.array(Season),
    ),
    approved: z.stringbool(),
    page: z.coerce.number(),
    limit: z.coerce.number(),
  })
  .partial();
export type QueryPerfumes = z.infer<typeof QueryPerfumes>;
// ---------------- URL Params ----------------
const PfParams = t.Object({ perfumeId: ID });
type PfParams = Static<typeof PfParams>;

// ---------------- Contexts Types ----------------
export interface PerfumesCTXs {
  CreatePfCtx: Ctx<CreatePerfumeBody>;
  QueryPfCtx: Ctx<unknown, unknown, QueryPerfumes>;
  ApprovePfCtx: Ctx<UpdatePerfumeBody, PfParams>;
  UpdatePfCtx: Ctx<UpdatePerfumeBody, PfParams>;
  DelPfCtx: Ctx<unknown, PfParams>;
}
// ---------------- Contexts Schema ----------------
export const ContextSchema = {
  QueryPf: { query: QueryPerfumes },
  CreatePf: { body: CreatePerfumeBody },
  ApprovePf: { params: PfParams, body: UpdatePerfumeBody },
  UpdatePf: { params: PfParams, body: UpdatePerfumeBody },
  DelPf: { params: PfParams },
};
