import Elysia from "elysia";
import { protect, restrictTo } from "../../../utils/auth";
import * as handlers from "./handlers";
import { ShopParams } from "../../../utils/globalSchema";
import {
  AgingParams,
  CompParams,
  CreateAging,
  CreateCompBody,
  CreateCompound,
  UpdateAging,
  UpdateCompoundBody,
} from "./schema";

export const perfumesCompoundsRouter = new Elysia({ prefix: "/compounds" })
  .use(protect)
  .use(restrictTo("owner"))
  .group("/", (app) =>
    app
      .post("", handlers.createComp, {
        params: ShopParams,
        body: CreateCompBody,
      })
      .get("", handlers.getShopCompounds, {
        params: ShopParams,
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
            body: CreateAging,
            params: CompParams,
          })
          .patch("/:agingId", handlers.updateCompAging, {
            params: AgingParams,
            body: UpdateAging,
          })
          .delete("/:agingId", handlers.deleteCompAging, {
            params: AgingParams,
          }),
      ),
  );
