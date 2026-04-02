import Elysia, { t } from "elysia";
import * as handlers from "./handlers";
import {
  ApprovedPerfumeBody,
  CreateAdminPerfumeBody,
  CreatePerfumeBody,
  UpdatePerfumeBody,
} from "./schema";

export const perfumesRouter = new Elysia({ prefix: "/perfumes" })
  .get("/", handlers.getPerfumesPublic)
  .get("/dashboard", handlers.getPerfumesDashboard)
  .post("/", handlers.createPerfume, {
    body: CreatePerfumeBody,
  })
  .post("/approved", handlers.createAdminPerfume, {
    body: CreateAdminPerfumeBody,
  })
  .patch("/:id/approve", handlers.approvePerfume, {
    params: t.Object({ id: t.Number() }),
    body: ApprovedPerfumeBody,
  })
  .patch("/:id", handlers.updatePerfume, {
    params: t.Object({ id: t.Number() }),
    body: UpdatePerfumeBody,
  })
  .delete("/:id", handlers.deletePerfume, {
    params: t.Object({ id: t.Number() }),
  });
