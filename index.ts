import { Elysia, t } from "elysia";
import { perfumesRouter } from "./modules/perfumes/router";
import { companiesRouter } from "./modules/companies/router";
import { usersRouter } from "./modules/users/router";
import { shopsRouter } from "./modules/shops/router";

export const app = new Elysia()
  .use(perfumesRouter)
  .use(companiesRouter)
  .use(usersRouter)
  .use(shopsRouter)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
