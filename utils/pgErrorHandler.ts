import { AppError } from "./AppError";

const CODES = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL_VIOLATION: "23502",
  CHECK_VIOLATION: "23514",
  STRING_TOO_LONG: "22001",
} as const;

interface PgError {
  code?: string;
  detail?: string;
  constraint?: string;
  column?: string;
  table?: string;
}

export function handlePgError(error: unknown) {
  if (!isPgError(error)) return null;

  const pgErr = (error as any).cause as PgError;

  switch (pgErr.code) {
    case CODES.UNIQUE_VIOLATION:
      return new AppError(409, "Record with this value already exists.");

    case CODES.FOREIGN_KEY_VIOLATION:
      return new AppError(400, "Reference resource does not exist.");

    case CODES.NOT_NULL_VIOLATION:
      return new AppError(400, `Field ${pgErr.column} is required.`);

    case CODES.CHECK_VIOLATION:
      return new AppError(
        400,
        `Invalid value for constraint '${pgErr.constraint}'`,
      );

    case CODES.STRING_TOO_LONG:
      return new AppError(400, `Value too long for field '${pgErr.column}'`);

    default:
      return null;
  }
}

function isPgError(err: any) {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in err.cause &&
    typeof err.cause.code === "string"
  );
}
