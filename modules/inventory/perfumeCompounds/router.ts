import Elysia from "elysia";

import { protect, restrictTo } from "../../../utils/auth";
import * as handlers from "./handlers";
import { CompSchema, type CompCTXs } from "./schema";
import { AppError } from "../../../utils/AppError";

export const perfumesCompoundsRouter = new Elysia({ prefix: "/compounds" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("", handlers.createComp, {
    beforeHandle: beforeHandleCreate,
    ...CompSchema.create,
  })
  .get("", handlers.getShopCompounds, CompSchema.queryAll)
  .get("/:compId", handlers.getBtlById, CompSchema.queryOne)
  .patch("/:compId", handlers.updateComp, CompSchema.update)
  .delete("/:compId", handlers.deleteComp, CompSchema.del)
  .group("/:compId/aging", (app) =>
    app
      .get("", handlers.getCompAgings, CompSchema.queryCompAgings)
      .get("/:agingId", handlers.getCompAgingById, CompSchema.queryOneAging)
      .post("", handlers.addAgingToComp, CompSchema.addAging)
      .patch("/:agingId", handlers.updateCompAging, CompSchema.updateAging)
      .delete("/:agingId", handlers.deleteCompAging, CompSchema.delAging),
  );

function beforeHandleCreate({ body }: { body: CompCTXs["create"]["body"] }) {
  const { compound } = body;

  if (compound.sprayAmountInMl! > 0) {
    const con = compound.concentration;
    if (!con || !(con < 1 || con > 100))
      throw new AppError(422, "Concentration is required for spray");

    if (!compound.alcoholId || compound.alcoholId <= 0)
      throw new AppError(
        422,
        "Alcohol id is required, to know what used in spray",
      );
  }
}
