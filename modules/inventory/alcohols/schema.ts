import { createInsertSchema } from "drizzle-typebox";
import { alcoholsTable } from "../../../db/schema";
import { t, type Static } from "elysia";
import { QueriesMeta } from "../../../utils/globalSchema";

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

// -------------- Query --------------
export const AlcoholsQueryFilters = t.Partial(
  t.Object({
    search: t.String(),
    type: t.String(),
    minAmount: t.Number({ minimum: 0 }),
    maxAmount: t.Number({ minimum: 0 }),
    amountUnit: t.Union([t.Literal("ml"), t.Literal("l")]),
    minLtPrice: t.Number({ minimum: 0 }),
    maxLtPrice: t.Number({ minimum: 0 }),
    minConcentration: t.Number({ maximum: 100, minimum: 1 }),
    maxConcentration: t.Number({ maximum: 100, minimum: 1 }),
    expiresBefore: t.String(),
    expiresAfter: t.String(),
    ...QueriesMeta,
  }),
);
export type AlcoholQueryFilters = Static<typeof AlcoholsQueryFilters>;
