CREATE TYPE "public"."amount_type" AS ENUM('spray', 'oil');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_method" AS ENUM('pickup', 'delivery');--> statement-breakpoint
CREATE TYPE "public"."occasion" AS ENUM('none', 'gift', 'apology', 'compensation', 'others');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('onhand', 'online');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'card', 'wallet');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "order_bottle_ingredients" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_bottle_ingredients_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_bottle_id" integer NOT NULL,
	"perfume_compound_name" text NOT NULL,
	"shop_compound_code" varchar(50) NOT NULL,
	"discount_amount" numeric(5, 2) DEFAULT '0',
	"amount" numeric(7, 3) NOT NULL,
	"amount_type" "amount_type" NOT NULL,
	"oil_unit_price" numeric(5, 2) NOT NULL,
	"subtotal" numeric(8, 2) NOT NULL,
	"total" numeric(8, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_bottle_ingredients_discount_nneg_chk" CHECK ("order_bottle_ingredients"."discount_amount" >= 0),
	CONSTRAINT "order_bottle_ingredients_oil_unit_price_nneg_chk" CHECK ("order_bottle_ingredients"."oil_unit_price" >= 0),
	CONSTRAINT "order_bottle_ingredients_subtotal_nneg_chk" CHECK ("order_bottle_ingredients"."subtotal" >= 0),
	CONSTRAINT "order_bottle_ingredients_total_nneg_chk" CHECK ("order_bottle_ingredients"."total" >= 0),
	CONSTRAINT "order_bottle_ingredients_amount_pos_chk" CHECK ("order_bottle_ingredients"."amount" > 0),
	CONSTRAINT "order_bottle_ingredients_discount_lte_subtotal_chk" CHECK ("order_bottle_ingredients"."discount_amount" <= "order_bottle_ingredients"."subtotal")
);
--> statement-breakpoint
CREATE TABLE "order_bottles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_bottles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_id" integer NOT NULL,
	"alcohol_amount" numeric(5, 2),
	"alcohol_ml_price" numeric(5, 2),
	"bottle_type" "bottle_type" NOT NULL,
	"bottle_catg" "bottle_category" DEFAULT 'normal' NOT NULL,
	"bottle_size" integer NOT NULL,
	"bottle_price" numeric(7, 2) NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"total" numeric(9, 3) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_bottles_bottle_price_nneg_chk" CHECK ("order_bottles"."bottle_price" >= 0),
	CONSTRAINT "order_bottles_total_nneg_chk" CHECK ("order_bottles"."total" >= 0),
	CONSTRAINT "order_bottles_bottle_size_pos_chk" CHECK ("order_bottles"."bottle_size" > 0),
	CONSTRAINT "order_bottles_qty_min_chk" CHECK ("order_bottles"."qty" >= 1),
	CONSTRAINT "order_bottles_bottle_type_alcohol_cons_chk" CHECK ("order_bottles"."bottle_type" != 'oil' OR (
        "order_bottles"."alcohol_amount"   = 0 AND
        "order_bottles"."alcohol_ml_price" = 0
      )),
	CONSTRAINT "order_bottles_alcohol_nonoil_pos_chk" CHECK ("order_bottles"."bottle_type" = 'oil' OR (
        "order_bottles"."alcohol_amount"   > 0 AND
        "order_bottles"."alcohol_ml_price" > 0
      ))
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_type" "order_type" NOT NULL,
	"order_status" "order_status" DEFAULT 'pending' NOT NULL,
	"fulfillment_method" "fulfillment_method" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending',
	"payment_method" "payment_method",
	"customer_name" varchar(50) NOT NULL,
	"customer_phone" varchar(50) NOT NULL,
	"shipping_country" varchar(50),
	"shipping_city" varchar(50),
	"shipping_street" varchar(50),
	"shipping_cost" numeric(6, 3),
	"occasion" "occasion" DEFAULT 'none' NOT NULL,
	"occasion_note" text,
	"subtotal" numeric(8, 2) NOT NULL,
	"discount_amount" numeric(5, 2) DEFAULT '0',
	"discount_reason" text,
	"total" numeric(8, 2) NOT NULL,
	"shop_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_subtotal_nneg_chk" CHECK ("orders"."subtotal" >= 0),
	CONSTRAINT "orders_total_nneg_chk" CHECK ("orders"."total" >= 0),
	CONSTRAINT "orders_discount_amount_nneg_chk" CHECK ("orders"."discount_amount" >= 0),
	CONSTRAINT "orders_shipping_cost_nneg_chk" CHECK ("orders"."shipping_cost" >= 0),
	CONSTRAINT "orders_discount_lte_subtotal_chk" CHECK ("orders"."discount_amount" <= "orders"."subtotal"),
	CONSTRAINT "orders_discount_reason_req_chk" CHECK ("orders"."discount_amount" = 0 OR "orders"."discount_reason" IS NOT NULL),
	CONSTRAINT "orders_occasion_note_req_chk" CHECK ("orders"."occasion" != 'others' OR "orders"."occasion_note" IS NOT NULL),
	CONSTRAINT "orders_shipping_req_chk" CHECK ("orders"."fulfillment_method" != 'delivery' OR (
        "orders"."shipping_country" IS NOT NULL AND
        "orders"."shipping_city"    IS NOT NULL AND
        "orders"."shipping_street"  IS NOT NULL
      )),
	CONSTRAINT "orders_payment_refund_chk" CHECK ("orders"."payment_status" != 'refunded' OR "orders"."order_status" = 'delivered'),
	CONSTRAINT "orders_onhand_noshipped_chk" CHECK ("orders"."order_type" != 'onhand' OR "orders"."order_status" != 'shipped')
);
--> statement-breakpoint
ALTER TABLE "order_bottle_ingredients" ADD CONSTRAINT "order_bottle_ingredients_order_bottle_id_fk" FOREIGN KEY ("order_bottle_id") REFERENCES "public"."order_bottles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_bottles" ADD CONSTRAINT "order_bottles_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE no action ON UPDATE no action;