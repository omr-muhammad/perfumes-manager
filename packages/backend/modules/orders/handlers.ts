import { response as res } from "../../utils/response";
import type { OrderCtx } from "./schema";
import * as orderService from "./service";

export async function createOrder(ctx: OrderCtx["create"]) {
  const { authPayload, body, params } = ctx;

  const order = await orderService.create(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Order created.", { order });
}

export async function updateOrder(ctx: OrderCtx["update"]) {
  const { authPayload, body, params } = ctx;

  const order = await orderService.update(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Order updated.", { order });
}

export async function updateOrderStatus(ctx: OrderCtx["updateStatus"]) {
  const { authPayload, params, body } = ctx;

  const order = await orderService.updateOrderStatus(
    { ...params, ownerId: authPayload.userId },
    body.newStatus,
  );

  return res.ok("Order status updated.", { newStatus: order.orderStatus });
}

export async function updateOrderPaymentStatus(
  ctx: OrderCtx["updatePaymentStatus"],
) {
  const { authPayload, params, body } = ctx;

  const order = await orderService.updatePaymentStatus(
    { ...params, ownerId: authPayload.userId },
    body.paymentStatus,
  );

  return res.ok("Payment status updated.", {
    newPaymentStatus: order.paymentStatus,
  });
}

export async function updateOrderFulfillmentMethod(
  ctx: OrderCtx["updateFulfillmentMethod"],
) {
  const { authPayload, params, body } = ctx;

  const order = await orderService.updateFulfillmentMethod(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Order fulfillment method updated.", {
    newFulfillmentMethod: order.fulfillmentMethod,
  });
}

export async function updateOrderShipping(ctx: OrderCtx["updateShipping"]) {
  const { authPayload, params, body } = ctx;

  const order = await orderService.updateShipping(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Order shipping updated.", {
    newShipping: {
      country: order.shippingCountry,
      city: order.shippingCity,
      street: order.shippingStreet,
      cost: order.shippingCost,
    },
  });
}

export async function getOrders(ctx: OrderCtx["query"]) {
  const { authPayload, params, query } = ctx;

  const orders = await orderService.queryAll(
    { ...params, ownerId: authPayload.userId },
    query,
  );

  return res.ok("Order fetched.", { orders });
}

export async function deleteOrder(ctx: OrderCtx["del"]) {
  const { authPayload, params } = ctx;

  const order = await orderService.softDel({
    ...params,
    ownerId: authPayload.userId,
  });

  return res.ok("Order deleted.", { orderId: order.id });
}
