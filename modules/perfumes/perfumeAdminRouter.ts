import Elysia from "elysia";
import * as handlers from "./handlers";
import { ContextSchema } from "./schema";
import { protect } from "../../utils/auth";

export const perfumesAdminRouter = new Elysia()
  .use(protect)
  .group("/:perfumeId", (app) =>
    app
      .patch("/approve", handlers.approvePerfume, ContextSchema.ApprovePf)
      .patch("", handlers.updatePerfume, ContextSchema.UpdatePf)
      .delete("", handlers.deletePerfume, ContextSchema.DelPf),
  );
