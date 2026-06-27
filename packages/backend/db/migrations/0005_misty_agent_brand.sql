ALTER TABLE "orders" DROP CONSTRAINT "orders_onhand_noshipped_chk";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "order_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."order_type";--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('onshop', 'online');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "order_type" SET DATA TYPE "public"."order_type" USING "order_type"::"public"."order_type";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_status_fulfillment_cons_chk" CHECK ("orders"."order_status" != 'shipped' OR "orders"."fulfillment_method" = 'delivery');