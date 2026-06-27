ALTER TABLE "order_bottles" DROP CONSTRAINT "order_bottles_alcohol_nonoil_pos_chk";--> statement-breakpoint
ALTER TABLE "order_bottles" DROP CONSTRAINT "order_bottles_bottle_type_alcohol_cons_chk";--> statement-breakpoint
ALTER TABLE "order_bottles" ADD CONSTRAINT "order_bottles_bottle_type_alcohol_cons_chk" CHECK ("order_bottles"."bottle_type" = 'oil' OR (
        "order_bottles"."alcohol_amount" > 0 AND
        "order_bottles"."ml_price_at_purchase" >= 0 AND
        "order_bottles"."ml_cost_at_purchase" >= 0
      ));