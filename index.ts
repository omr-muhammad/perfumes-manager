import { Elysia, t } from "elysia";
import { perfumesRouter } from "./modules/perfumes/router";
import { companiesRouter } from "./modules/companies/router";
import { usersRouter } from "./modules/users/router";
import { authJWTPlugin } from "./utils/jwtPlugins";

export const app = new Elysia()
  .use(authJWTPlugin)
  .use(perfumesRouter)
  .use(companiesRouter)
  .use(usersRouter)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
