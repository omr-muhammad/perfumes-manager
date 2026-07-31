import { t } from "elysia";
import type { TLiteral } from "@sinclair/typebox";

export function enumToUnion<T extends readonly [string, ...string[]]>(pgEnum: {
  enumValues: T;
}) {
  return pgEnum.enumValues.map((v) => t.Literal(v)) as {
    [K in keyof T]: TLiteral<T[K]>;
  };
}
