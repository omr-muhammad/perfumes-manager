import { t, type Static } from "elysia";

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
