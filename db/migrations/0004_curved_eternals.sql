ALTER TABLE "amount_tiers" DROP CONSTRAINT IF EXISTS "discount_type_cannot_be_null_when_pricing_type_discount";--> statement-breakpoint
ALTER TABLE "amount_tiers" DROP CONSTRAINT IF EXISTS "discount_percentage_cannot_go_over_100";--> statement-breakpoint
ALTER TABLE "amount_tiers" ADD CONSTRAINT "discount_fields_must_match_pricing_type" CHECK (
        ("amount_tiers"."pricing_type" = 'fixed' AND COALSCE("amount_tiers"."discount_type", "amount_tiers"."max_discount_amount") IS NULL)
        OR
        ("amount_tiers"."pricing_type" = 'discount' AND "amount_tiers"."discount_type" IS NOT NULL)
      );--> statement-breakpoint
ALTER TABLE "amount_tiers" ADD CONSTRAINT "discount_percentage_cannot_go_over_100" CHECK (
      "amount_tiers"."pricing_type" != 'discount'
      OR
      "amount_tiers"."discount_type" = 'fixed'
      OR
      "amount_tiers"."value" BETWEEN 0 AND 100 -- pricing type is discount and discount type is percentage
    );