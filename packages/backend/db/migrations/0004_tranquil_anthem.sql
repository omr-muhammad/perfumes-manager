ALTER TABLE "order_bottle_ingredients" DROP CONSTRAINT "order_bottle_ingredients_order_bottle_id_fk";
--> statement-breakpoint
ALTER TABLE "order_bottles" DROP CONSTRAINT "order_bottles_order_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_shop_id_fk";
--> statement-breakpoint
ALTER TABLE "shop_compound_lots" drop column "ml_cost";--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ADD COLUMN "ml_cost" numeric(10, 4) GENERATED ALWAYS AS (concentration / 100.0 * density_snapshot * (kilo_cost / 1000)) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_compound_lots" drop column "ml_price";--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ADD COLUMN "ml_price" numeric(10, 4) GENERATED ALWAYS AS (concentration / 100.0 * density_snapshot * (kilo_price / 1000)) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "order_bottle_ingredients" ADD CONSTRAINT "order_bottle_ingredients_order_bottle_id_fk" FOREIGN KEY ("order_bottle_id") REFERENCES "public"."order_bottles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_bottles" ADD CONSTRAINT "order_bottles_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE restrict ON UPDATE no action;