CREATE TABLE "bottles_lots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bottles_lots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"received_at" timestamp DEFAULT now() NOT NULL,
	"status" "lot_status" NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"remaining_stock" integer NOT NULL,
	"buy_price" numeric(5, 2) NOT NULL,
	"price" numeric(5, 2) NOT NULL,
	"bottle_id" integer NOT NULL,
	CONSTRAINT "duplicate_lot" UNIQUE("bottle_id","received_at","buy_price","stock"),
	CONSTRAINT "cost_price_must_be_lte_sell_price" CHECK (
        "bottles_lots"."buy_price" <= "bottles_lots"."price"
    ),
	CONSTRAINT "remaining_stock_must_lte_base_stock" CHECK (
            "bottles_lots"."remaining_stock" <= "bottles_lots"."stock"
        )
);
--> statement-breakpoint
ALTER TABLE "bottles" DROP CONSTRAINT "bottle_must_have_unique_sku";--> statement-breakpoint
ALTER TABLE "bottles" DROP CONSTRAINT "bottle_prices_cannot_be_negative";--> statement-breakpoint
ALTER TABLE "bottles" DROP CONSTRAINT "bottle_sell_price_must_be_above_buy_price_or_equal";--> statement-breakpoint
ALTER TABLE "bottles" DROP CONSTRAINT "bottle_stock_must_be_positive";--> statement-breakpoint
ALTER TABLE "bottles" ALTER COLUMN "sku" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "bottles_lots" ADD CONSTRAINT "bottles_lots_bottle_id_bottles_id_fk" FOREIGN KEY ("bottle_id") REFERENCES "public"."bottles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bottles" DROP COLUMN "buy_price";--> statement-breakpoint
ALTER TABLE "bottles" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "bottles" DROP COLUMN "stock";--> statement-breakpoint
ALTER TABLE "bottles" ADD CONSTRAINT "duplicate_bottle" UNIQUE("shop_id","sku");