ALTER TABLE "alcohol_lots" RENAME COLUMN "cost_per_liter" TO "liter_cost";--> statement-breakpoint
ALTER TABLE "alcohol_lots" RENAME COLUMN "base_sell_per_liter" TO "liter_price";--> statement-breakpoint
ALTER TABLE "alcohol_lots" RENAME COLUMN "base_ml_sell" TO "ml_price";--> statement-breakpoint
ALTER TABLE "amount_tiers" RENAME COLUMN "max_discount_amount" TO "max_amount";--> statement-breakpoint
ALTER TABLE "order_bottle_ingredients" RENAME COLUMN "oil_unit_price" TO "unit_price";--> statement-breakpoint
ALTER TABLE "order_bottles" RENAME COLUMN "bottle_price" TO "bottle_price_at_purchase";--> statement-breakpoint
ALTER TABLE "shop_compound_lots" RENAME COLUMN "cost_per_kilo" TO "kilo_cost";--> statement-breakpoint
ALTER TABLE "shop_compound_lots" RENAME COLUMN "base_sell_per_kilo" TO "kilo_price";--> statement-breakpoint
ALTER TABLE "shop_compound_lots" RENAME COLUMN "base_gm_sell" TO "gm_price";--> statement-breakpoint
ALTER TABLE "alcohol_lots" DROP CONSTRAINT "alcohol_lots_uq";--> statement-breakpoint
ALTER TABLE "shop_compound_lots" DROP CONSTRAINT "comp_lots_uq";--> statement-breakpoint
ALTER TABLE "alcohol_lots" DROP CONSTRAINT "alcohol_lots_cost_lte_base_chk";--> statement-breakpoint
ALTER TABLE "amount_tiers" DROP CONSTRAINT "amount_tiers_value_pos_chk";--> statement-breakpoint
ALTER TABLE "amount_tiers" DROP CONSTRAINT "amount_tiers_discount_price_type_cons_chk";--> statement-breakpoint
ALTER TABLE "amount_tiers" DROP CONSTRAINT "amount_tiers_discount_percentage_range_chk";--> statement-breakpoint
ALTER TABLE "order_bottle_ingredients" DROP CONSTRAINT "order_bottle_ingredients_oil_unit_price_nneg_chk";--> statement-breakpoint
ALTER TABLE "order_bottles" DROP CONSTRAINT "order_bottles_bottle_price_nneg_chk";--> statement-breakpoint
ALTER TABLE "order_bottles" DROP CONSTRAINT "order_bottles_bottle_type_alcohol_cons_chk";--> statement-breakpoint
ALTER TABLE "order_bottles" DROP CONSTRAINT "order_bottles_alcohol_nonoil_pos_chk";--> statement-breakpoint
ALTER TABLE "alcohol_lots" ALTER COLUMN "amountInMl" SET DATA TYPE numeric(15, 4);--> statement-breakpoint
ALTER TABLE "alcohol_lots" ALTER COLUMN "amountInMl" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "alcohol_lots" ALTER COLUMN "remaining_amount" SET DATA TYPE numeric(15, 4);--> statement-breakpoint
ALTER TABLE "alcohol_lots" ALTER COLUMN "remaining_amount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "order_bottles" ALTER COLUMN "alcohol_amount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "order_bottles" ALTER COLUMN "bottle_size" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ALTER COLUMN "oil_amount_gm" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ALTER COLUMN "oil_amount_gm" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ALTER COLUMN "spray_amount_ml" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ALTER COLUMN "spray_amount_ml" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ALTER COLUMN "remaining_oil_amount" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ALTER COLUMN "remaining_oil_amount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ALTER COLUMN "remaining_spray_amount" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ALTER COLUMN "remaining_spray_amount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD COLUMN "ml_cost" numeric(5, 2) GENERATED ALWAYS AS (liter_cost / 1000) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "bottles_lots" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "bottles_lots" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "order_bottle_ingredients" ADD COLUMN "unit_cost" numeric(5, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "order_bottles" ADD COLUMN "ml_price_at_purchase" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "order_bottles" ADD COLUMN "ml_cost_at_purchase" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "order_bottles" ADD COLUMN "bottle_cost_at_purchase" numeric(7, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ADD COLUMN "gm_cost" numeric(10, 4) GENERATED ALWAYS AS (kilo_cost / 1000.0) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ADD COLUMN "ml_cost" numeric(10, 4) GENERATED ALWAYS AS (concentration / 100.0 * density_snapshot * (kilo_cost / 1000)) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ADD COLUMN "ml_price" numeric(10, 4) GENERATED ALWAYS AS (concentration / 100.0 * density_snapshot * (kilo_price / 1000)) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "amount_tiers" DROP COLUMN "discount_type";--> statement-breakpoint
ALTER TABLE "order_bottles" DROP COLUMN "alcohol_ml_price";--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_uq" UNIQUE("amountInMl","received_at","liter_cost");--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ADD CONSTRAINT "comp_lots_uq" UNIQUE("shop_compound_id","received_at","kilo_cost");--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_cost_lte_base_chk" CHECK (
    "alcohol_lots"."liter_cost" <=   "alcohol_lots"."liter_price"
  );--> statement-breakpoint
ALTER TABLE "amount_tiers" ADD CONSTRAINT "amount_tiers_value_nneg_chk" CHECK (
      "amount_tiers"."value" >= 0
    );--> statement-breakpoint
ALTER TABLE "amount_tiers" ADD CONSTRAINT "amount_tiers_discount_percentage_range_chk" CHECK (
      "amount_tiers"."pricing_type" != 'discount'
      OR
      "amount_tiers"."value" BETWEEN 0 AND 100 -- pricing type is discount and discount type is percentage
    );--> statement-breakpoint
ALTER TABLE "order_bottle_ingredients" ADD CONSTRAINT "order_bottle_ingredients_oil_unit_price_nneg_chk" CHECK ("order_bottle_ingredients"."unit_price" >= 0);--> statement-breakpoint
ALTER TABLE "order_bottles" ADD CONSTRAINT "order_bottles_bottle_cost_nneg_chk" CHECK ("order_bottles"."bottle_cost_at_purchase" >= 0);--> statement-breakpoint
ALTER TABLE "order_bottles" ADD CONSTRAINT "order_bottles_bottle_price_nneg_chk" CHECK ("order_bottles"."bottle_price_at_purchase" >= 0);--> statement-breakpoint
ALTER TABLE "order_bottles" ADD CONSTRAINT "order_bottles_bottle_type_alcohol_cons_chk" CHECK ("order_bottles"."bottle_type" = 'oil' OR (
        "order_bottles"."alcohol_amount" IS NULL AND
        "order_bottles"."ml_price_at_purchase" IS NULL AND
        "order_bottles"."ml_cost_at_purchase" IS NULL
      ));--> statement-breakpoint
ALTER TABLE "order_bottles" ADD CONSTRAINT "order_bottles_alcohol_nonoil_pos_chk" CHECK ("order_bottles"."bottle_type" = 'oil' OR (
        "order_bottles"."alcohol_amount" > 0
      ));