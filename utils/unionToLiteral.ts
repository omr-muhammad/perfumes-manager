import { t } from "elysia";

export function enumToUnion<T extends readonly string[]>(pgEnumObj: {
  enumValues: T;
}) {
  // T[number] extracts the literal union from the array: "manager" | "cashier"
  return t.Unsafe<T[number]>({
    type: "string",
    enum: pgEnumObj.enumValues,
  });
}

export function toEnum<T extends readonly [string, ...string[]]>(pgEnumObj: {
  enumValues: T;
}) {
  const enumObj = Object.fromEntries(
    pgEnumObj.enumValues.map((v) => [v, v]),
  ) as { [K in T[number]]: K };

  return t.Enum(enumObj);
}
