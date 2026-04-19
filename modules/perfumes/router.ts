import Elysia, { t } from "elysia";
import * as handlers from "./handlers";
import {
  ApprovedPerfumeBody,
  CreateAdminPerfumeBody,
  CreatePerfumeBody,
  PublicQueryFilters,
  DashboardQueryFilters,
  UpdatePerfumeBody,
} from "./schema";
import { protect } from "../../utils/auth";
import { authPlugin } from "../../utils/jwtPlugin";

export const perfumesRouter = new Elysia({ prefix: "/perfumes" })
  .use(authPlugin)
  .get("/", handlers.getPublicPerfumes, {
    query: PublicQueryFilters,
  })
  .use(protect)
  .get("/dashboard", handlers.getDashboardPerfumes, {
    query: DashboardQueryFilters,
  })
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
