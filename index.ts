import { Elysia } from "elysia";
import { perfumesRouter } from "./modules/perfumes/router";

const app = new Elysia().use(perfumesRouter).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
