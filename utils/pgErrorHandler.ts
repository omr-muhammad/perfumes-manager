import { AppError } from "./AppError";

const CODES = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL_VIOLATION: "23502",
  CHECK_VIOLATION: "23514",
  STRING_TOO_LONG: "22001",
  EXCLUSION_VOILATION: "23P01",
} as const;

interface PgError {
  code?: string;
  errno: string;
  detail?: string;
  constraint?: string;
  column?: string;
  table?: string;
}

export function handlePgError(error: unknown) {
  if (!isPgError(error)) return null;

  const pgErr = (error as any).cause as PgError;

  switch (pgErr.errno) {
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

    case CODES.EXCLUSION_VOILATION:
      const { attempt, conflicting } = parseOverlapDetail(pgErr.detail!);
      return new AppError(
        409,
        `Amount range ${attempt} ovelaps with existing range ${conflicting} (and possibly others 😁)`,
      );

    default:
      return null;
  }
}

function isPgError(err: any) {
  return (
    err !== null &&
    typeof err === "object" &&
    typeof err.cause === "object" &&
    "code" in err.cause &&
    typeof err.cause.code === "string"
  );
}

function parseOverlapDetail(detail: string) {
  const matches = [...detail.matchAll(/[\[(][\d]+,[\d]+[\])](?=\))/g)];
  const [attempt, conflicting] = matches.map((m) => m[0]);
  return { attempt, conflicting };
}
