import Elysia from "elysia";
import { protect, restrictTo } from "../../../utils/auth";
import * as handlers from "./handlers";
import { ShopParams } from "../../../utils/globalSchema";
import {
  AgingParams,
  CompoundsQueryFilters,
  CompParams,
  CreateAgingBody,
  CreateCompBody,
  CreateCompound,
  RemoveAgingBody,
  UpdateAgingBody,
  UpdateCompoundBody,
} from "./schema";

export const perfumesCompoundsRouter = new Elysia({ prefix: "/compounds" })
  .use(protect)
  .use(restrictTo("owner"))
  .group("/", (app) =>
    app
      .post("", handlers.createComp, {
        beforeHandle: ({ body, status }) => {
          const { compound } = body;

          if (compound.sprayAmountInMl! > 0) {
            const con = compound.concentration;
            if (!con || !(con < 1 || con > 100)) {
              status(422);
              throw new Error("Concnetration is required, between 1 and 100");
            }

            if (!compound.alcoholId || compound.alcoholId <= 0) {
              status(422);
              throw new Error(
                "Alcohol id is required, expected positive integer",
              );
            }
          }
        },
        params: ShopParams,
        body: CreateCompBody,
      })
      .get("", handlers.getShopCompounds, {
        params: ShopParams,
        query: CompoundsQueryFilters,
      }),
  )
  .group("/:compId", (app) =>
    app
      .get("", handlers.getBtlById, {
        params: CompParams,
      })
      .patch("", handlers.updateComp, {
        params: CompParams,
        body: UpdateCompoundBody,
      })
      .delete("", handlers.deleteComp, {
        params: CompParams,
      })
      .group("/aging", (app) =>
        app
          .get("", handlers.getCompAgings, {
            params: CompParams,
          })
          .get("/:agingId", handlers.getCompAgingById, {
            params: AgingParams,
          })
          .post("", handlers.addAgingToComp, {
            body: CreateAgingBody,
            params: CompParams,
          })
          .patch("/:agingId", handlers.updateCompAging, {
            params: AgingParams,
            body: UpdateAgingBody,
          })
          .delete("/:agingId", handlers.deleteCompAging, {
            params: AgingParams,
            body: RemoveAgingBody,
          }),
      ),
  );
