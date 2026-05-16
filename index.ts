import { Elysia } from "elysia";
import { perfumesRouter } from "./modules/perfumes/router";
import { companiesRouter } from "./modules/companies/router";
import { usersRouter } from "./modules/users/router";
import { shopsRouter } from "./modules/shops/router";
import { AppError } from "./utils/AppError";
import { handlePgError } from "./utils/pgErrorHandler";
import { response as res } from "./utils/response";
import { adminRouter } from "./modules/admin/router";
import util from "node:util";
import { handleValidation } from "./utils/validationErrorHandler";

export const app = new Elysia({ prefix: "/api" })
  .onError(({ code, error, set }) => {
    console.error(
      `\n[${code}]`,
      util.inspect(error, { depth: null, colors: true }),
    );

    const isDev = Bun.env.NODE_ENV === "development";

    if (error instanceof AppError) {
      set.status = error.statusCode;

      return res.fail(error.message, {
        ...(isDev && { error: error, stack: error.stack }),
      });
    }

    // Elysia Validation
    if (code === "VALIDATION") {
      const errors = handleValidation(error);

      set.status = error.status || 422;
      return res.fail("Invalid input data", {
        errors,
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
  .use(adminRouter)
  .use(perfumesRouter)
  .use(companiesRouter)
  .use(usersRouter)
  .use(shopsRouter)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
