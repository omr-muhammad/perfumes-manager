import Elysia from "elysia";
import * as handlers from "./handlers";
import { CtxSchema } from "./schema";
import { protect } from "../../utils/auth";

export const orderRouter = new Elysia({ prefix: "/orders" })
  .use(protect)
  .post("", handlers.createOrder, CtxSchema.create)
  .get("", handlers.getOrders, CtxSchema.query)
  .group("/:orderId", (app) =>
    app
      .patch("", handlers.updateOrder, CtxSchema.update)
      .patch("/status", handlers.updateOrderStatus, CtxSchema.updateStatus)
      .patch(
        "/shipping",
        handlers.updateOrderShipping,
        CtxSchema.updateShipping,
      )
      .patch(
        "/payment-status",
        handlers.updateOrderPaymentStatus,
        CtxSchema.updatePaymentStatus,
      )
      .patch(
        "/fulfillment",
        handlers.updateOrderFulfillmentMethod,
        CtxSchema.updateFulfillmentMethod,
      )
      .delete("", handlers.deleteOrder, CtxSchema.del),
  );
