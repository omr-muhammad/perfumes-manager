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
import { ShopParams, type Ctx } from "../../utils/globalSchema";

const OrderType = z.enum(orderTypeEn.enumValues, {
  error: `Order type must be one of (${orderTypeEn.enumValues.join(", ")})`,
});

const OrderStatus = z.enum(orderStatusEn.enumValues, {
  error: `Order status must be one of (${orderStatusEn.enumValues.join(", ")})`,
});
export type OrderStatus = z.infer<typeof OrderStatus>;

const FulfillmentMethod = z.enum(fulfillmentMethodEn.enumValues, {
  error: `Fulfillment method must be one of (${fulfillmentMethodEn.enumValues.join(", ")})`,
});
const PaymentStatus = z.enum(paymentStatusEn.enumValues, {
  error: `Payment status must be one of (${paymentStatusEn.enumValues.join(", ")})`,
});
export type PaymentStatus = z.infer<typeof PaymentStatus>;

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

// ------------------- Update Order -------------------
const UpdateOrder = z.object({
  occasion: Occasion.optional(),
  occasionNote: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: PaymentMethod.optional(),
});

export type UpdateOrder = z.infer<typeof UpdateOrder>;

const UpdateStatus = z.object({
  newStatus: OrderStatus,
});
type UpdateStatus = z.infer<typeof UpdateStatus>;

const UpdatePaymentStatus = z.object({
  paymentStatus: PaymentStatus,
});
type UpdatePaymentStatus = z.infer<typeof UpdatePaymentStatus>;

const UpdateShipping = z.object({
  country: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  cost: z.string().optional(),
});
export type UpdateShipping = z.infer<typeof UpdateShipping>;

const UpdateFulfillment = z
  .object({
    newMethod: FulfillmentMethod,
    shipping: UpdateShipping.optional(),
  })
  .refine((val) => val.newMethod !== "delivery" || val.shipping !== undefined, {
    error: `Shipping data is required when updating fulfillment method to delivery.`,
  });
export type UpdateFulfillment = z.infer<typeof UpdateFulfillment>;
// ----------------------------------------------------

export const orderQuerySchema = z
  .object({
    orderType: z.enum(orderTypeEn.enumValues).optional(),
    orderStatus: z.enum(orderStatusEn.enumValues).optional(),
    fulfillmentMethod: z.enum(fulfillmentMethodEn.enumValues).optional(),
    paymentStatus: z.enum(paymentStatusEn.enumValues).optional(),
    paymentMethod: z.enum(paymentMethodEn.enumValues).optional(),
    occasion: z.enum(occasionEn.enumValues).optional(),

    shopId: z.coerce.number().int().positive().optional(),

    customerName: z.string().trim().min(1).max(50).optional(),
    customerPhone: z.string().trim().min(1).max(50).optional(),

    createdFrom: z.coerce.date().optional(),
    createdTo: z.coerce.date().optional(),

    minTotal: z.coerce.number().nonnegative().optional(),
    maxTotal: z.coerce.number().nonnegative().optional(),

    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),

    sortBy: z.enum(["createdAt", "total", "customerName"]).default("createdAt"),
    sortDir: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (q) => !q.createdFrom || !q.createdTo || q.createdFrom <= q.createdTo,
    { message: "createdFrom must be before createdTo", path: ["createdFrom"] },
  )
  .refine(
    (q) =>
      q.minTotal === undefined ||
      q.maxTotal === undefined ||
      q.minTotal <= q.maxTotal,
    { message: "minTotal must be ≤ maxTotal", path: ["minTotal"] },
  );

export type OrderQuery = z.infer<typeof orderQuerySchema>;

// ------------------- URL Params -------------------
const OrderParams = z.object({
  shopId: z.coerce.number().positive(),
  orderId: z.coerce.number().positive(),
});
type OrderParams = z.infer<typeof OrderParams>;
// --------------------------------------------------

// ------------------- Service IDs -------------------
export interface IDs {
  base: { ownerId: number; shopId: number };
  extended: IDs["base"] & { orderId: number };
}
// ---------------------------------------------------

// ------------------- Context Types -------------------
export interface OrderCtx {
  create: Ctx<Order, ShopParams>;

  update: Ctx<UpdateOrder, OrderParams>;
  updateStatus: Ctx<UpdateStatus, OrderParams>;
  updatePaymentStatus: Ctx<UpdatePaymentStatus, OrderParams>;
  updateShipping: Ctx<UpdateShipping, OrderParams>;
  updateFulfillmentMethod: Ctx<UpdateFulfillment, OrderParams>;

  query: Ctx<unknown, ShopParams, OrderQuery>;

  del: Ctx<unknown, OrderParams>;
}
// ------------------- Context Schema -------------------
export const CtxSchema = {
  create: { body: Order, params: ShopParams },

  update: { body: UpdateOrder, params: OrderParams },
  updateStatus: { body: UpdateStatus, params: OrderParams },
  updatePaymentStatus: { body: UpdatePaymentStatus, params: OrderParams },
  updateShipping: { body: UpdateShipping, params: OrderParams },
  updateFulfillmentMethod: { body: UpdateFulfillment, params: OrderParams },

  query: { params: ShopParams, query: orderQuerySchema },

  del: { params: OrderParams },
};
// ------------------------------------------------------
