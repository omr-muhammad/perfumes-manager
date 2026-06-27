ALTER TABLE "order_bottle_ingredients" DROP CONSTRAINT "order_bottle_ingredients_order_bottle_id_fk";
--> statement-breakpoint
ALTER TABLE "order_bottles" DROP CONSTRAINT "order_bottles_order_id_fk";
--> statement-breakpoint
ALTER TABLE "order_bottle_ingredients" ADD CONSTRAINT "order_bottle_ingredients_order_bottle_id_fk" FOREIGN KEY ("order_bottle_id") REFERENCES "public"."order_bottles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_bottles" ADD CONSTRAINT "order_bottles_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;