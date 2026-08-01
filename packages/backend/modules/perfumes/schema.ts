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
  QueryPfsCtx: Ctx<unknown, unknown, QueryPerfumes>;
  QueryPfCtx: Ctx<unknown, PfParams, unknown>;
  ApprovePfCtx: Ctx<UpdatePerfumeBody, PfParams>;
  UpdatePfCtx: Ctx<UpdatePerfumeBody, PfParams>;
  DelPfCtx: Ctx<unknown, PfParams>;
}
// ---------------- Contexts Schema ----------------
export const ContextSchema = {
  QueryPfs: {
    query: QueryPerfumes,
    detail: {
      summary: "List perfumes",
      tags: ["Perfumes"],
    },
  },
  QueryPf: {
    params: PfParams,
    detail: {
      summary: "Get a perfume by id",
      tags: ["Perfumes"],
    },
  },
  CreatePf: {
    body: CreatePerfumeBody,
    detail: {
      summary: "Create a perfume",
      tags: ["Perfumes"],
    },
  },
  ApprovePf: {
    params: PfParams,
    body: UpdatePerfumeBody,
    detail: {
      summary: "Approve a perfume",
      tags: ["Admin - Perfumes"],
    },
  },
  UpdatePf: {
    params: PfParams,
    body: UpdatePerfumeBody,
    detail: {
      summary: "Update a perfume",
      tags: ["Admin - Perfumes"],
    },
  },
  DelPf: {
    params: PfParams,
    detail: {
      summary: "Delete a perfume",
      tags: ["Admin - Perfumes"],
    },
  },
};
