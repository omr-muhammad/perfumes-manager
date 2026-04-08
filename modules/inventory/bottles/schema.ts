import { createInsertSchema } from "drizzle-typebox";
import { bottlesTable } from "../../../db/schema";
import { t, type Static } from "elysia";

const BottlesSchema = createInsertSchema(bottlesTable, {
  size: t.Number({ minimum: 1 }),
  price: t.Number({ minimum: 0 }),
});

export const CreateBottleBody = t.Omit(BottlesSchema, [
  "shopId",
  "createdAt",
  "updatedAt",
]);
export type CreateBottleBody = Static<typeof CreateBottleBody>;

export const UpdateBottleBody = t.Partial(CreateBottleBody);
export type UpdateBottleBody = Static<typeof UpdateBottleBody>;
