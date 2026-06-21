import z from "zod";
import {
  discountTypeEn,
  fulfillmentMethodEn,
  occasionEn,
  orderStatusEn,
  orderTypeEn,
  paymentMethodEn,
  paymentStatusEn,
} from "../../db/schema/enums";

const OrderType = z.enum(orderTypeEn.enumValues, {
  error: `Order type must be one of (${orderTypeEn.enumValues.join(", ")})`,
});
const OrderStatus = z.enum(orderStatusEn.enumValues, {
  error: `Order status must be one of (${orderStatusEn.enumValues.join(", ")})`,
});
const FulfillmentMethod = z.enum(fulfillmentMethodEn.enumValues, {
  error: `Fulfillment method must be one of (${fulfillmentMethodEn.enumValues.join(", ")})`,
});
const PaymentStatus = z.enum(paymentStatusEn.enumValues, {
  error: `Payment status must be one of (${paymentStatusEn.enumValues.join(", ")})`,
});

const PaymentMethod = z.enum(paymentMethodEn.enumValues, {
  error: `Payment method must be one of (${paymentMethodEn.enumValues.join(", ")})`,
});

const Occasion = z.enum(occasionEn.enumValues, {
  error: `Occasion must be one of (${occasionEn.enumValues.join(", ")})`,
});

const DiscountType = z.enum(discountTypeEn.enumValues, {
  error: `Discount type must be one of (${discountTypeEn.enumValues.join(", ")})`,
});

// ------------------- Create Order -------------------
const BottleIngredients = z
  .object({
    shopCompId: z.number().min(1),
    amount: z.number().min(1),
    amountType: z.enum(["spray", "oil"], {
      error: `Amount type can only be 'spray' or 'oil'.`,
    }),
    amountUnit: z
      .enum(["gm", "ml"], {
        error: `Amount unit can only be 'gm' or 'ml'`,
      })
      .optional(),
  })
  .refine(
    (ing) =>
      ing.amountType === "oil"
        ? !!ing.amountUnit
        : ing.amountUnit === undefined,
    {
      error: `Amount unit is required when type set to oil otherwise not.`,
    },
  );

const OrderBottles = z
  .object({
    bottleId: z.number().min(1),
    qty: z.number().min(1),
    alcoholId: z.number().optional(),
    alcoholAmount: z.number().min(0).optional(),
    ingredients: z.array(BottleIngredients),
  })
  .refine((btl) => ((btl.alcoholAmount ?? 0) > 0 ? btl.alcoholId : true), {
    error: `Alcohol is required while alcohol amount greater than 0.`,
  });
export type OrderBottles = z.infer<typeof OrderBottles>;

const Order = z
  .object({
    orderType: OrderType,
    orderStatus: OrderStatus,
    fulfillmentMethod: FulfillmentMethod,
    payment: z.object({
      status: PaymentStatus,
      method: PaymentMethod,
    }),
    customer: z.object({
      name: z.string(),
      phone: z.string(),
    }),
    shipping: z
      .object({
        country: z.string(),
        city: z.string(),
        street: z.string(),
        cost: z.string(),
      })
      .optional(),
    occasion: Occasion,
    occasionNote: z.string().optional(),
    discount: z
      .object({
        type: DiscountType,
        value: z.number(),
        maxValue: z.number().optional(),
      })
      .optional(),
    discountReason: z.string().optional(),
    bottles: z.array(OrderBottles),
  })
  .superRefine((order, ctx) => {
    if (order.fulfillmentMethod === "delivery" && !order.shipping)
      ctx.addIssue({
        code: "custom",
        message: `Shipping is required while fulfillment set to delivery`,
      });

    if (["failed", "refunded"].includes(order.payment.status))
      ctx.addIssue({
        code: "custom",
        message: `Payment method cannot be failed or refunded in creation.`,
      });

    if (order.orderStatus === "cancelled")
      ctx.addIssue({
        code: "custom",
        message: `Order type cannot set to 'cancelled' in creation.`,
      });

    if (order.occasion === "others" && !order.occasionNote)
      ctx.addIssue({
        code: "custom",
        message: `Occasion note is required when occasion value equals 'others'.`,
      });

    const { discount, discountReason } = order;
    if (discount && !discountReason)
      ctx.addIssue({
        code: "custom",
        message: "Discount reason is required for discounted orders.",
      });

    if (
      discount &&
      discount.type === "percentage" &&
      (discount.value < 1 || discount.value > 100)
    )
      ctx.addIssue({
        code: "custom",
        message: `Discount value must come between 1 and 100 while precentage.`,
      });
  });
export type Order = z.infer<typeof Order>;
// ----------------------------------------------------

// ------------------- Service IDs -------------------
export interface IDs {
  base: { ownerId: number; shopId: number };
}
// ---------------------------------------------------

// ------------------- Service IDs -------------------
export interface IDs {
  base: { ownerId: number; shopId: number };
}
// ---------------------------------------------------
