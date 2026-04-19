import { Elysia } from "elysia";
import { perfumesRouter } from "./modules/perfumes/router";
import { companiesRouter } from "./modules/companies/router";
import { usersRouter } from "./modules/users/router";
import { shopsRouter } from "./modules/shops/router";
import { AppError } from "./utils/AppError";
import { handlePgError } from "./utils/pgErrorHandler";
import { response as res } from "./utils/response";

export const app = new Elysia({ prefix: "/api" })
  .onError(({ code, error, set }) => {
    const isDev = Bun.env.NODE_ENV === "development";

    if (error instanceof AppError) {
      set.status = error.statusCode;

      return res.fail(error.message, {
        ...(isDev && { error: error, stack: error.stack }),
      });
    }

    // Elysia Validation
    if (code === "VALIDATION") {
      set.status = 400;
      return res.fail("Invalid input data", {
        details: error.all,
        ...(isDev && { error, stack: error.stack }),
      });
    }

    // PostgreSQL
    const pgError = handlePgError(error);

    if (pgError) {
      set.status = pgError.statusCode;
      return res.fail(pgError.message, {
        ...(isDev && { error: pgError, stack: pgError.stack }),
      });
    }

    console.error("Unhandled Error: ", error);
    console.error("Error Cause: ", (error as any).cause);

    set.status = 500;
    return { success: false, message: "Internal server error" };
  })
  .use(perfumesRouter)
  .use(companiesRouter)
  .use(usersRouter)
  .use(shopsRouter)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
