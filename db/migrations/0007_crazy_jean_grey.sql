ALTER TABLE "order_bottles" DROP CONSTRAINT "order_bottles_bottle_type_alcohol_cons_chk";--> statement-breakpoint
ALTER TABLE "order_bottles" ADD CONSTRAINT "order_bottles_bottle_type_alcohol_cons_chk" CHECK ("order_bottles"."bottle_type" != 'oil' OR (
        "order_bottles"."alcohol_amount" IS NULL AND
        "order_bottles"."ml_price_at_purchase" IS NULL AND
        "order_bottles"."ml_cost_at_purchase" IS NULL
      ));