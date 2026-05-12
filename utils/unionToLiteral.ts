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
