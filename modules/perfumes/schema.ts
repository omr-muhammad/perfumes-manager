import { t, type Static } from "elysia";
import { sexValues } from "../../utils/contants";

// ---------------- Create ----------------
// - staff
export const CreatePerfumeBody = t.Object({
  name: t.String(),
});
export type CreatePerfumeBody = Static<typeof CreatePerfumeBody>;

// - admin
export const CreateAdminPerfumeBody = t.Object({
  name: t.String(),
  seasons: t.Array(
    t.Union([
      t.Literal("spring"),
      t.Literal("summer"),
      t.Literal("fall"),
      t.Literal("winter"),
    ]),
  ),
  sex: t.Union([t.Literal("men"), t.Literal("women"), t.Literal("unisex")]),
  description: t.String(),
});
export type CreateAdminPerfumeBody = Static<typeof CreateAdminPerfumeBody>;

// ---------------- Approve (admin) ----------------
export const ApprovedPerfumeBody = t.Object({
  name: t.Optional(t.String()),
  seasons: t.Array(
    t.Union([
      t.Literal("spring"),
      t.Literal("summer"),
      t.Literal("fall"),
      t.Literal("winter"),
    ]),
  ),
  sex: t.Union([t.Literal("men"), t.Literal("women"), t.Literal("unisex")]),
  description: t.String(),
});
export type ApprovedPerfumeBody = Static<typeof ApprovedPerfumeBody>;

// ---------------- Update (admin) ----------------
export const UpdatePerfumeBody = t.Partial(CreateAdminPerfumeBody);
export type UpdatePerfumeBody = Static<typeof UpdatePerfumeBody>;

// ---------------- Query ----------------
export const DashboardQueryFilters = t.Object({
  sex: t.Optional(t.Union(sexValues.map((s) => t.Literal(s)))),
  seasons: t.Optional(t.String()),
  approved: t.Optional(t.BooleanString()),
  search: t.Optional(t.String({ minLength: 1 })),
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
});
export const PublicQueryFilters = t.Omit(DashboardQueryFilters, ["approved"]);

export type DashboardQueryFilters = Static<typeof DashboardQueryFilters>;
export type PublicQueryFilters = Omit<DashboardQueryFilters, "approved">;

export type Season = "winter" | "summer" | "fall" | "spring";
