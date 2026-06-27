ALTER TABLE "amount_tiers" DROP CONSTRAINT "amount_tiers_value_nneg_chk";--> statement-breakpoint
ALTER TABLE "order_bottles" DROP CONSTRAINT "order_bottles_bottle_type_alcohol_cons_chk";--> statement-breakpoint
ALTER TABLE "amount_tiers" ADD CONSTRAINT "amount_tiers_value_pos_chk" CHECK (
      "amount_tiers"."value" >= 0
    );--> statement-breakpoint
ALTER TABLE "order_bottles" ADD CONSTRAINT "order_bottles_bottle_type_alcohol_cons_chk" CHECK ("order_bottles"."bottle_type" != 'oil' OR (
        "order_bottles"."alcohol_amount" IS NULL AND
        "order_bottles"."ml_price_at_purchase" IS NULL AND
        "order_bottles"."ml_cost_at_purchase" IS NULL
      ));