ALTER TABLE "alcohols" ALTER COLUMN "lt_buy_price" SET DATA TYPE numeric(5, 2);--> statement-breakpoint
ALTER TABLE "alcohols" ALTER COLUMN "lt_sell_price" SET DATA TYPE numeric(5, 2);--> statement-breakpoint
ALTER TABLE "alcohols" ALTER COLUMN "unit_sell_price" SET DATA TYPE numeric(5, 2);--> statement-breakpoint
ALTER TABLE "bottles" ALTER COLUMN "price" SET DATA TYPE numeric(5, 2);--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD COLUMN "kilo_buy_price" numeric(15, 4) NOT NULL;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD COLUMN "kilo_sell_price" numeric(15, 4) NOT NULL;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD COLUMN "ml_price" numeric(10, 4) NOT NULL;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "ml_price_cannot_be_negative" CHECK (
        "perfumes_compounds"."ml_price" > 0
      );--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "kilo_prices_cannot_be_negative" CHECK (
        "perfumes_compounds"."kilo_buy_price" > 0 AND "perfumes_compounds"."kilo_sell_price" > 0
      );