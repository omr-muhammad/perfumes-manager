import { createInsertSchema } from "drizzle-typebox";
import { bottlesTable } from "../../../db/schema";
import { t, type Static } from "elysia";
import { ID } from "../../../utils/globalSchema";

const BottlesSchema = createInsertSchema(bottlesTable, {
  size: t.Number({ minimum: 1 }),
  sellPrice: t.Number({ minimum: 0 }),
  buyPrice: t.Number({ minimum: 0 }),
});

export const CreateBottleBody = t.Omit(BottlesSchema, [
  "shopId",
  "createdAt",
  "updatedAt",
]);
export type CreateBottleBody = Static<typeof CreateBottleBody>;

export const UpdateBottleBody = t.Partial(CreateBottleBody);
export type UpdateBottleBody = Static<typeof UpdateBottleBody>;

export const BtlInvParams = t.Object({
  shopId: ID,
  btlId: ID,
});
export type BtlInvParams = Static<typeof BtlInvParams>;
