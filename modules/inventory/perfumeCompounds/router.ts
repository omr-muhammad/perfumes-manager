import Elysia from "elysia";

import { protect, restrictTo } from "../../../utils/auth";
import * as handlers from "./handlers";
import { CompSchema, type CompCTXs } from "./schema";
import { AppError } from "../../../utils/AppError";
import { compAmountRouter } from "../amountTiers/router";

export const perfumesCompoundsRouter = new Elysia({ prefix: "/compounds" })
  .use(protect)
  .use(restrictTo("owner"))
  .post("", handlers.createComp, {
    beforeHandle: beforeHandleCreate,
    ...CompSchema.createComp,
  })
  .get("", handlers.getShopCompounds, CompSchema.queryAllComps)
  .group("/:compId", (app) =>
    app
      .get("", handlers.getCompById, CompSchema.queryCompById)
      .patch("", handlers.updateComp, CompSchema.updateComp)
      .delete("", handlers.deleteComp, CompSchema.delComp)

      // /:compId/lots
      .post("/lots", handlers.createCompLot, CompSchema.createCompLot)
      .group("/lots/:lotId", (app) =>
        app
          .patch("", handlers.updateCompLot, CompSchema.updateCompLot)
          .delete("", handlers.delCompLot, CompSchema.delCompLot)
          .patch(
            "/stock",
            handlers.updateCompLotStock,
            CompSchema.updateLotStock,
          )

          // /:compId/lots/:lotId/amount-tiers
          .group("/amount-tiers", (app) => app.use(compAmountRouter))

          // /:compId/lots/:lotId/agings
          .get("/agings", handlers.getLotAgings, CompSchema.queryLotAgings)
          .post("/agings", handlers.addAgingToLot, CompSchema.createLotAging)

          // /:compId/lots/:lotId/agings/:agingId
          .group("/:agingId", (app) =>
            app
              .get("", handlers.getLotAgingById, CompSchema.queryOneAging)
              .patch("", handlers.updateLotAging, CompSchema.updateLotAging)
              .delete("", handlers.deleteLotAging, CompSchema.delLotAging),
          ),
      ),
  );

function beforeHandleCreate({
  body,
}: {
  body: CompCTXs["createComp"]["body"];
}) {
  const { lot } = body;

  if ((lot.oilAmountGm || 0) <= 0 && (lot.sprayAmountMl || 0) <= 0)
    throw new AppError(
      422,
      "Cannot create compound while oil and spray amounts are 0.",
    );

  if (lot.sprayAmountMl !== undefined && lot.sprayAmountMl > 0) {
    if (!lot.concentration)
      throw new AppError(
        422,
        "Concentration is required when spray amount greater than 0.",
      );

    if (!lot.alcoholId)
      throw new AppError(
        422,
        "Alcohol id is required, when spray amount greater than 0",
      );
  }
}
