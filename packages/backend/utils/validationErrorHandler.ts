import util from "node:util";
import type { TSchema, ValidationError } from "elysia";

export function handleValidation(e: Readonly<ValidationError>) {
  console.error(
    `Validation Error: `,
    util.inspect(e, { depth: null, colors: true }),
  );
  // When using TypeBox Errors will always be in e.validator
  // @ts-expect-error
  const errors = [...e.validator.Errors(e.value)];
  return errors.map((err) => {
    // console.error("Err: ", util.inspect(err, { depth: null, colors: true }));

    const field = err.path.split("/").pop();

    // Custom Error Message
    if (err.schema.error) return { field, error: err.schema.error };

    // No value Provided
    if (!err.value) {
      const message = `Expected ${field} to be ${err.schema.type}, but got nothing!`;

      return { field, error: message };
    }

    // fallback to default message
    return { field, error: err.message };
  });
}
