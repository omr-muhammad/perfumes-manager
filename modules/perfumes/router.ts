import Elysia, { t } from "elysia";
import * as handlers from "./handlers";
import {
  ApprovedPerfumeBody,
  CreateAdminPerfumeBody,
  CreatePerfumeBody,
  PublicQueryFilters,
  DashboardQueryFilters,
  UpdatePerfumeBody,
  PfParams,
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
  .patch("/:perfumeId/approve", handlers.approvePerfume, {
    params: PfParams,
    body: ApprovedPerfumeBody,
  })
  .patch("/:perfumeId", handlers.updatePerfume, {
    params: PfParams,
    body: UpdatePerfumeBody,
  })
  .delete("/:perfumeId", handlers.deletePerfume, {
    params: PfParams,
  });
