import { t, type Static } from "elysia";

export const AdminCreateCompanyBody = t.Object({
  name: t.String(),
  country: t.String(),
  logo: t.Optional(t.String()),
});
export type AdminCreateCompanyBody = Static<typeof AdminCreateCompanyBody>;

export const ApproveCompnayBody = t.Object({
  name: t.Optional(t.String()),
  country: t.String(),
  logo: t.Optional(t.String()),
});
export type ApproveCompnayBody = Static<typeof ApproveCompnayBody>;

export const UpdateCompanyBody = t.Partial(AdminCreateCompanyBody);
export type UpdateCompanyBody = Static<typeof UpdateCompanyBody>;
