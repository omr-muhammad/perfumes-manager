ALTER TABLE "amount_tiers" DROP CONSTRAINT IF EXISTS "discount_fields_must_match_pricing_type";--> statement-breakpoint
ALTER TABLE "amount_tiers" ADD CONSTRAINT "discount_fields_must_match_pricing_type" CHECK (
        (
          "amount_tiers"."pricing_type" = 'fixed' AND 
          "amount_tiers"."discount_type" IS NULL AND 
          "amount_tiers"."max_discount_amount" IS NULL
        )
        OR
        ("amount_tiers"."pricing_type" = 'discount' AND "amount_tiers"."discount_type" IS NOT NULL)
      );