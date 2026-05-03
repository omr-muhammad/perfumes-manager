CREATE TYPE "public"."bottle_category" AS ENUM('normal', 'elegant');--> statement-breakpoint
CREATE TYPE "public"."bottle_type" AS ENUM('spray', 'oil', 'tester');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('global', 'local');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('ar', 'en');--> statement-breakpoint
CREATE TYPE "public"."lot_status" AS ENUM('inuse', 'ready', 'expired');--> statement-breakpoint
CREATE TYPE "public"."pricing_type" AS ENUM('discount', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'owner', 'staff', 'customer');--> statement-breakpoint
CREATE TYPE "public"."seasons" AS ENUM('winter', 'spring', 'summer', 'fall');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('male', 'female', 'unisex');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('manager', 'cashier');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "addresses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"country" varchar(50) NOT NULL,
	"city" varchar(50) NOT NULL,
	"district" varchar(50) DEFAULT '',
	"street" varchar(50) NOT NULL,
	"building_number" smallint,
	"notes" text DEFAULT '',
	"shop_id" integer,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "addresses_shop_id_unique" UNIQUE("shop_id"),
	CONSTRAINT "addresses_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "address_must_refer_to_shop_or_user" CHECK (
      COALESCE("addresses"."user_id"::BOOLEAN::INTEGER, 0) 
      +
      COALESCE("addresses"."shop_id"::BOOLEAN::INTEGER, 0) 
      = 1
    )
);
--> statement-breakpoint
CREATE TABLE "agings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "agings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" integer NOT NULL,
	"concentration" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"lot_id" integer NOT NULL,
	"alcohol_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "duplicate_entry" UNIQUE("amount","start_date","end_date","lot_id"),
	CONSTRAINT "amount_must_be_positive" CHECK (
        "agings"."amount" > 0
      ),
	CONSTRAINT "invalid_concnetration_range" CHECK (
        "agings"."concentration" BETWEEN 1 AND 100
      )
);
--> statement-breakpoint
CREATE TABLE "alcohol_lots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "alcohol_lots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"receivedAt" timestamp DEFAULT now() NOT NULL,
	"status" "lot_status" NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"remaining_amount" integer NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"cost_per_liter" numeric(10, 3) NOT NULL,
	"base_sell_per_liter" numeric(10, 3) NOT NULL,
	"base_ml_sell" numeric(5, 2) GENERATED ALWAYS AS (base_sell_per_liter / 1000) STORED NOT NULL,
	"alcohol_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lot_is_already_exist" UNIQUE("amount","receivedAt","cost_per_liter"),
	CONSTRAINT "cost_price_must_be_lte_selling_price" CHECK (
    "alcohol_lots"."cost_per_liter" <=   "alcohol_lots"."base_sell_per_liter"
  ),
	CONSTRAINT "remaining_amount_cannot_exceed_main_amount" CHECK (
      "alcohol_lots"."remaining_amount" <= "alcohol_lots"."amount"  
    )
);
--> statement-breakpoint
CREATE TABLE "alcohols" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "alcohols_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"concentration" smallint DEFAULT 96,
	"shop_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alcohol_must_be_unique" UNIQUE("name","type","concentration","shop_id"),
	CONSTRAINT "concentration_must_be_between_1_and_100" CHECK ("alcohols"."concentration" > 0 AND "alcohols"."concentration" <= 100)
);
--> statement-breakpoint
CREATE TABLE "amount_tiers" (
	"id" integer GENERATED ALWAYS AS IDENTITY (sequence name "amount_tiers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"shop_id" integer NOT NULL,
	"compound_id" integer NOT NULL,
	"amount_range" "int4range" NOT NULL,
	"pricing_type" "pricing_type" NOT NULL,
	"value" numeric(10, 4) NOT NULL,
	"discount_type" "discount_type",
	"max_discount_amount" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "value_cannot_be_negative" CHECK (
      "amount_tiers"."value" >= 0
    ),
	CONSTRAINT "discount_type_cannot_be_null_when_pricing_type_discount" CHECK (
    "amount_tiers"."pricing_type" = 'fixed'
    OR
    "amount_tiers"."discount_type" IS NOT NULL
  ),
	CONSTRAINT "discount_percentage_cannot_go_over_100" CHECK (
      "amount_tiers"."pricing_type" != 'discount'
      OR
      "amount_tiers"."discount_type" = 'fixed'
      OR
      "amount_tiers"."discount_type" = 'percentage' AND "amount_tiers"."value" <= 100
    )
);
--> statement-breakpoint
CREATE TABLE "bottles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bottles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50),
	"sku" varchar(50) NOT NULL,
	"type" "bottle_type" NOT NULL,
	"size" smallint NOT NULL,
	"category" "bottle_category" NOT NULL,
	"buy_price" numeric(5, 2) NOT NULL,
	"price" numeric(5, 2) NOT NULL,
	"img" text,
	"shop_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "bottle_must_have_unique_sku" UNIQUE("sku","shop_id","size"),
	CONSTRAINT "bottle_size_must_be_positive" CHECK (
      "bottles"."size" > 0
    ),
	CONSTRAINT "bottle_prices_cannot_be_negative" CHECK (
      "bottles"."price" >= 0 AND "bottles"."buy_price" >= 0
    ),
	CONSTRAINT "bottle_sell_price_must_be_above_buy_price_or_equal" CHECK (
        "bottles"."price" >= "bottles"."buy_price"
      ),
	CONSTRAINT "bottle_stock_must_be_positive" CHECK (
        "bottles"."stock" >= 0
      )
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "companies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"country" varchar(50),
	"approved" boolean DEFAULT false,
	"logo" text DEFAULT '',
	"type" "type" DEFAULT 'global' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_name_and_country_must_be_unique" UNIQUE("name","country"),
	CONSTRAINT "approved_required_completed_info" CHECK (
      NOT "companies"."approved"
        OR
      "companies"."country" IS NOT NULL
    )
);
--> statement-breakpoint
CREATE TABLE "compound_lots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "compound_lots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"received_at" timestamp DEFAULT now() NOT NULL,
	"density_snapshot" numeric(4, 3) NOT NULL,
	"status" "lot_status" NOT NULL,
	"cost_per_kilo" numeric(10, 4) NOT NULL,
	"base_sell_per_kilo" numeric(10, 4) NOT NULL,
	"base_gm_sell" numeric(10, 4) GENERATED ALWAYS AS (base_sell_per_kilo / 1000) STORED NOT NULL,
	"oil_amount_gm" integer DEFAULT 0,
	"spray_amount_ml" integer DEFAULT 0,
	"concentration" smallint,
	"remaining_oil_amount" integer DEFAULT 0,
	"remaining_spray_amount" integer DEFAULT 0,
	"compound_id" integer NOT NULL,
	"alcohol_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "perfume_compound_lot_must_be_unique" UNIQUE("received_at","compound_id"),
	CONSTRAINT "oil_or_spray_amount_must_be_available" CHECK (
    "compound_lots"."oil_amount_gm" > 0 OR "compound_lots"."spray_amount_ml" > 0  
  ),
	CONSTRAINT "concentration_required_when_spray_amount_more_than_0" CHECK ("compound_lots"."spray_amount_ml" = 0 OR "compound_lots"."concentration" BETWEEN 1 AND 100),
	CONSTRAINT "alcohol_id_is_required_when_spray_amount_greater_than_0" CHECK (
        "compound_lots"."spray_amount_ml" = 0
        OR
        "compound_lots"."alcohol_id" IS NOT NULL
      ),
	CONSTRAINT "remaining_amount_cannot_go_over_base_amount" CHECK (
        "compound_lots"."remaining_oil_amount" <= "compound_lots"."oil_amount_gm" 
        AND
        "compound_lots"."remaining_spray_amount" <= "compound_lots"."spray_amount_ml"
      )
);
--> statement-breakpoint
CREATE TABLE "perfumes_compounds" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "perfumes_compounds_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"density" numeric(4, 3) DEFAULT '0.9' NOT NULL,
	"code" varchar(50) NOT NULL,
	"perfume_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"shop_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "duplicate_compound" UNIQUE("perfume_id","company_id","shop_id","code")
);
--> statement-breakpoint
CREATE TABLE "perfumes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "perfumes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"seasons" "seasons"[],
	"sex" "sex",
	"description" text DEFAULT '',
	"approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "perfumes_name_unique" UNIQUE("name"),
	CONSTRAINT "approved_requires_completed_info" CHECK (
      NOT "perfumes"."approved"
      OR (
        "perfumes"."seasons" IS NOT NULL
        AND array_length("perfumes"."seasons", 1) > 0
        AND "perfumes"."sex" IS NOT NULL
        AND "perfumes"."description" != ''
      )
    ),
	CONSTRAINT "seasons_array_cannot_exceed_four" CHECK (
        NOT "perfumes"."approved"
        OR
        array_length("perfumes"."seasons", 1) <= 4
      )
);
--> statement-breakpoint
CREATE TABLE "shop_staff" (
	"shop_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "staff_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "id" PRIMARY KEY("shop_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "shops" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shops_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"owner_id" integer NOT NULL,
	"logo" text DEFAULT '',
	"active" boolean DEFAULT true NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shops_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(200) NOT NULL,
	"role" "role" DEFAULT 'customer' NOT NULL,
	"language" "language" DEFAULT 'ar',
	"phone" varchar(50),
	"active" boolean DEFAULT true NOT NULL,
	"token_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "username_must_be_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agings" ADD CONSTRAINT "agings_lot_id_compound_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."compound_lots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agings" ADD CONSTRAINT "agings_alcohol_id_alcohols_id_fk" FOREIGN KEY ("alcohol_id") REFERENCES "public"."alcohols"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_alcohol_id_alcohols_id_fk" FOREIGN KEY ("alcohol_id") REFERENCES "public"."alcohols"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "alcohols_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "amount_tiers" ADD CONSTRAINT "amount_tiers_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "amount_tiers" ADD CONSTRAINT "amount_tiers_compound_id_perfumes_compounds_id_fk" FOREIGN KEY ("compound_id") REFERENCES "public"."perfumes_compounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bottles" ADD CONSTRAINT "bottles_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compound_lots" ADD CONSTRAINT "compound_lots_compound_id_perfumes_compounds_id_fk" FOREIGN KEY ("compound_id") REFERENCES "public"."perfumes_compounds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compound_lots" ADD CONSTRAINT "compound_lots_alcohol_id_alcohols_id_fk" FOREIGN KEY ("alcohol_id") REFERENCES "public"."alcohols"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "perfumes_compounds_perfume_id_perfumes_id_fk" FOREIGN KEY ("perfume_id") REFERENCES "public"."perfumes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "perfumes_compounds_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "perfumes_compounds_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_staff" ADD CONSTRAINT "shop_staff_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_staff" ADD CONSTRAINT "shop_staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;