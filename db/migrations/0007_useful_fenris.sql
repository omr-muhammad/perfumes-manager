ALTER TABLE "alcohols" DROP CONSTRAINT "alcohols_name_type_lt_buy_price_concentration_shop_id_made_date_unique";--> statement-breakpoint
ALTER TABLE "alcohols" DROP CONSTRAINT "expiry_date_must_be_greater_than_made_date";--> statement-breakpoint
ALTER TABLE "alcohols" DROP COLUMN "made_date";--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "alcohol_must_be_unique" UNIQUE("name","type","lt_buy_price","concentration","shop_id");