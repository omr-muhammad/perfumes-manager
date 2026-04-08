import { createInsertSchema } from "drizzle-typebox";
import { alcoholsTable } from "../../../db/schema";
import { t, type Static } from "elysia";

const AlcoholDrivedSchema = createInsertSchema(alcoholsTable, {
  ltBuyPrice: t.Number({ minimum: 0 }),
  ltSellPrice: t.Number({ minimum: 0 }),
  amountInMl: t.Number({ minimum: 0 }),
  concentration: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
  expiryDate: t.String(),
});

export const CreateAlcoBody = t.Omit(AlcoholDrivedSchema, [
  "shopId",
  "unitSellPrice",
]);
export type CreateAlcoBody = Static<typeof CreateAlcoBody>;

export const UpdateAlcoBody = t.Partial(CreateAlcoBody);
export type UpdateAlcoBody = Static<typeof UpdateAlcoBody>;
