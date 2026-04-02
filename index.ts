import { Elysia } from "elysia";
import { perfumesRouter } from "./modules/perfumes/router";
import { companiesRouter } from "./modules/companies/router";

const app = new Elysia().use(perfumesRouter).use(companiesRouter).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
