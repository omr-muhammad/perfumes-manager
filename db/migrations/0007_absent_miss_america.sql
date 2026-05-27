ALTER TABLE "alcohol_lots" RENAME COLUMN "amount" TO "amountInMl";--> statement-breakpoint
ALTER TABLE "alcohol_lots" DROP CONSTRAINT "lot_is_already_exist";--> statement-breakpoint
ALTER TABLE "bottles_lots" DROP CONSTRAINT "duplicate_lot";--> statement-breakpoint
ALTER TABLE "compound_lots" DROP CONSTRAINT "perfume_compound_lot_must_be_unique";--> statement-breakpoint
ALTER TABLE "alcohol_lots" DROP CONSTRAINT "cost_price_must_be_lte_selling_price";--> statement-breakpoint
ALTER TABLE "alcohol_lots" DROP CONSTRAINT "remaining_amount_cannot_exceed_main_amount";--> statement-breakpoint
ALTER TABLE "bottles_lots" DROP CONSTRAINT "cost_price_must_be_lte_sell_price";--> statement-breakpoint
ALTER TABLE "bottles_lots" DROP CONSTRAINT "remaining_stock_must_lte_base_stock";--> statement-breakpoint
ALTER TABLE "compound_lots" DROP CONSTRAINT "oil_or_spray_amount_must_be_available";--> statement-breakpoint
ALTER TABLE "compound_lots" DROP CONSTRAINT "concentration_required_when_spray_amount_more_than_0";--> statement-breakpoint
ALTER TABLE "compound_lots" DROP CONSTRAINT "alcohol_id_is_required_when_spray_amount_greater_than_0";--> statement-breakpoint
ALTER TABLE "compound_lots" DROP CONSTRAINT "remaining_amount_cannot_go_over_base_amount";--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_key" UNIQUE("amountInMl","received_at","cost_per_liter");--> statement-breakpoint
ALTER TABLE "bottles_lots" ADD CONSTRAINT "btls_lots_uq" UNIQUE("bottle_id","received_at","buy_price","stock");--> statement-breakpoint
ALTER TABLE "compound_lots" ADD CONSTRAINT "comp_lots_uq" UNIQUE("compound_id","received_at","cost_per_kilo");--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_cost_per_liter_base_sell_per_liter_chk" CHECK (
    "alcohol_lots"."cost_per_liter" <=   "alcohol_lots"."base_sell_per_liter"
  );--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_amount_remaining_amount_chk" CHECK (
      "alcohol_lots"."remaining_amount" <= "alcohol_lots"."amountInMl"  
    );--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_remaining_amount_chk" CHECK (
      "alcohol_lots"."remaining_amount" >= 0  
    );--> statement-breakpoint
ALTER TABLE "bottles_lots" ADD CONSTRAINT "btl_lots_price_pos_chk" CHECK (
        "bottles_lots"."buy_price" >= 0 AND "bottles_lots"."price" >= 0
      );--> statement-breakpoint
ALTER TABLE "bottles_lots" ADD CONSTRAINT "btls_lots_cost_lte_sell_chk" CHECK (
        "bottles_lots"."buy_price" <= "bottles_lots"."price"
    );--> statement-breakpoint
ALTER TABLE "bottles_lots" ADD CONSTRAINT "btls_lots_remaining_lte_stock_chk" CHECK (
            "bottles_lots"."remaining_stock" <= "bottles_lots"."stock"
        );--> statement-breakpoint
ALTER TABLE "bottles_lots" ADD CONSTRAINT "bottles_lots_remaining_stock_pos_chk" CHECK (
        "bottles_lots"."remaining_stock" >= 0
      );--> statement-breakpoint
ALTER TABLE "compound_lots" ADD CONSTRAINT "comp_lots_oil_spray_amount_pos_chk" CHECK (
    "compound_lots"."oil_amount_gm" > 0 OR "compound_lots"."spray_amount_ml" > 0  
  );--> statement-breakpoint
ALTER TABLE "compound_lots" ADD CONSTRAINT "comp_lots_concentration_chk" CHECK ("compound_lots"."spray_amount_ml" = 0 OR "compound_lots"."concentration" BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "compound_lots" ADD CONSTRAINT "comp_lots_alcohol_chk" CHECK (
        "compound_lots"."spray_amount_ml" = 0
        OR
        "compound_lots"."alcohol_id" IS NOT NULL
      );--> statement-breakpoint
ALTER TABLE "compound_lots" ADD CONSTRAINT "comp_lots_remaining_lte_amount_chk" CHECK (
        "compound_lots"."remaining_oil_amount" <= "compound_lots"."oil_amount_gm" 
        AND
        "compound_lots"."remaining_spray_amount" <= "compound_lots"."spray_amount_ml"
      );--> statement-breakpoint
ALTER TABLE "compound_lots" ADD CONSTRAINT "comp_lots_stock_gte_0_chk" CHECK (
        "compound_lots"."oil_amount_gm" >= 0 AND 
        "compound_lots"."remaining_oil_amount" >= 0 AND
        "compound_lots"."spray_amount_ml" >= 0 AND
        "compound_lots"."remaining_spray_amount" >= 0
      );