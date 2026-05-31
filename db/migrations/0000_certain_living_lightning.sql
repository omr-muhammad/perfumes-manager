CREATE TYPE "public"."bottle_category" AS ENUM('normal', 'elegant');--> statement-breakpoint
CREATE TYPE "public"."bottle_type" AS ENUM('spray', 'oil', 'tester');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('global', 'local');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('shop_compound', 'bottle', 'alcohol');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('ar', 'en');--> statement-breakpoint
CREATE TYPE "public"."lot_status" AS ENUM('inuse', 'ready', 'depleted', 'expired');--> statement-breakpoint
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
	"building_number" varchar,
	"notes" text DEFAULT '',
	"shop_id" integer,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "addresses_shop_id_unique" UNIQUE("shop_id"),
	CONSTRAINT "addresses_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "addresses_shop_or_user_fk" CHECK (
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
	CONSTRAINT "agings_uq" UNIQUE("amount","start_date","end_date","lot_id"),
	CONSTRAINT "agings_amount_pos_chk" CHECK (
        "agings"."amount" > 0
      ),
	CONSTRAINT "agings_concentration_range_chk" CHECK (
        "agings"."concentration" BETWEEN 1 AND 100
      )
);
--> statement-breakpoint
CREATE TABLE "alcohol_lots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "alcohol_lots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"received_at" timestamp DEFAULT now() NOT NULL,
	"status" "lot_status" NOT NULL,
	"amountInMl" integer DEFAULT 0 NOT NULL,
	"remaining_amount" integer NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"cost_per_liter" numeric(10, 3) NOT NULL,
	"base_sell_per_liter" numeric(10, 3) NOT NULL,
	"base_ml_sell" numeric(5, 2) GENERATED ALWAYS AS (base_sell_per_liter / 1000) STORED NOT NULL,
	"alcohol_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alcohol_lots_uq" UNIQUE("amountInMl","received_at","cost_per_liter"),
	CONSTRAINT "alcohol_lots_cost_lte_base_chk" CHECK (
    "alcohol_lots"."cost_per_liter" <=   "alcohol_lots"."base_sell_per_liter"
  ),
	CONSTRAINT "alcohol_lots_amounts_nneg_chk" CHECK (
      "alcohol_lots"."remaining_amount" >= 0 AND "alcohol_lots"."amountInMl" >= 0 
    ),
	CONSTRAINT "alcohol_lots_remaining_lte_amount_chk" CHECK (
      "alcohol_lots"."remaining_amount" <= "alcohol_lots"."amountInMl"  
    ),
	CONSTRAINT "alcohol_lots_expiry_date_future_chk" CHECK (
        "alcohol_lots"."expiry_date" > NOW()
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
	CONSTRAINT "alcohols_uq" UNIQUE("name","type","concentration","shop_id"),
	CONSTRAINT "alcohols_concentration_range_chk" CHECK ("alcohols"."concentration" > 0 AND "alcohols"."concentration" <= 100)
);
--> statement-breakpoint
CREATE TABLE "amount_tiers" (
	"id" integer GENERATED ALWAYS AS IDENTITY (sequence name "amount_tiers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"entity_id" integer,
	"entity_type" "entity_type" NOT NULL,
	"amount_range" "int4range" NOT NULL,
	"pricing_type" "pricing_type" NOT NULL,
	"value" numeric(10, 4) NOT NULL,
	"discount_type" "discount_type",
	"max_discount_amount" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "amount_tiers_value_pos_chk" CHECK (
      "amount_tiers"."value" >= 0
    ),
	CONSTRAINT "amount_tiers_discount_price_type_cons_chk" CHECK (
        (
          "amount_tiers"."pricing_type" = 'fixed' AND 
          "amount_tiers"."discount_type" IS NULL AND 
          "amount_tiers"."max_discount_amount" IS NULL
        )
        OR
        ("amount_tiers"."pricing_type" = 'discount' AND "amount_tiers"."discount_type" IS NOT NULL)
      ),
	CONSTRAINT "amount_tiers_discount_percentage_range_chk" CHECK (
      "amount_tiers"."pricing_type" != 'discount'
      OR
      "amount_tiers"."discount_type" = 'fixed'
      OR
      "amount_tiers"."value" BETWEEN 0 AND 100 -- pricing type is discount and discount type is percentage
    )
);
--> statement-breakpoint
CREATE TABLE "bottles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bottles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50),
	"type" "bottle_type" NOT NULL,
	"size" smallint NOT NULL,
	"sku" varchar(100) NOT NULL,
	"category" "bottle_category" NOT NULL,
	"img" text,
	"shop_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bottles_uq" UNIQUE("shop_id","sku"),
	CONSTRAINT "bottles_size_pos_chk" CHECK (
      "bottles"."size" > 0
    )
);
--> statement-breakpoint
CREATE TABLE "bottles_lots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bottles_lots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"received_at" timestamp DEFAULT now() NOT NULL,
	"status" "lot_status" NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"remaining_stock" integer NOT NULL,
	"buy_price" numeric(5, 2) NOT NULL,
	"price" numeric(5, 2) NOT NULL,
	"bottle_id" integer NOT NULL,
	CONSTRAINT "btls_lots_uq" UNIQUE("bottle_id","received_at","buy_price","stock"),
	CONSTRAINT "btl_lots_price_nneg_chk" CHECK (
        "bottles_lots"."buy_price" >= 0 AND "bottles_lots"."price" >= 0
      ),
	CONSTRAINT "btls_lots_cost_lte_sell_chk" CHECK (
        "bottles_lots"."buy_price" <= "bottles_lots"."price"
    ),
	CONSTRAINT "bottles_lots_stocks_nneg_chk" CHECK (
        "bottles_lots"."stock" >= 0 AND "bottles_lots"."remaining_stock" >= 0
      ),
	CONSTRAINT "btls_lots_remaining_lte_stock_chk" CHECK (
            "bottles_lots"."remaining_stock" <= "bottles_lots"."stock"
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
	CONSTRAINT "companies_uq" UNIQUE("name","country"),
	CONSTRAINT "companies_approved_chk" CHECK (
      NOT "companies"."approved"
        OR
      "companies"."country" IS NOT NULL
    )
);
--> statement-breakpoint
CREATE TABLE "shop_compound_lots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shop_compound_lots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
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
	"shop_compound_id" integer NOT NULL,
	"alcohol_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "comp_lots_uq" UNIQUE("shop_compound_id","received_at","cost_per_kilo"),
	CONSTRAINT "comp_lots_oil_spray_amount_pos_chk" CHECK (
    "shop_compound_lots"."oil_amount_gm" > 0 OR "shop_compound_lots"."spray_amount_ml" > 0  
  ),
	CONSTRAINT "comp_lots_concentration_range_chk" CHECK ("shop_compound_lots"."spray_amount_ml" = 0 OR "shop_compound_lots"."concentration" BETWEEN 1 AND 100),
	CONSTRAINT "comp_lots_alcohol_chk" CHECK (
        "shop_compound_lots"."spray_amount_ml" = 0
        OR
        "shop_compound_lots"."alcohol_id" IS NOT NULL
      ),
	CONSTRAINT "comp_lots_remaining_lte_amount_chk" CHECK (
        "shop_compound_lots"."remaining_oil_amount" <= "shop_compound_lots"."oil_amount_gm" 
        AND
        "shop_compound_lots"."remaining_spray_amount" <= "shop_compound_lots"."spray_amount_ml"
      ),
	CONSTRAINT "comp_lots_stock_gte_0_chk" CHECK (
        "shop_compound_lots"."oil_amount_gm" >= 0 AND 
        "shop_compound_lots"."remaining_oil_amount" >= 0 AND
        "shop_compound_lots"."spray_amount_ml" >= 0 AND
        "shop_compound_lots"."remaining_spray_amount" >= 0
      )
);
--> statement-breakpoint
CREATE TABLE "perfumes_compounds" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "perfumes_compounds_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"perfume_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"density" numeric(4, 3) DEFAULT '0.9' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pc_uq" UNIQUE("perfume_id","company_id")
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
	CONSTRAINT "perfumes_uq" UNIQUE("name"),
	CONSTRAINT "perfumes_approved_chk" CHECK (
      NOT "perfumes"."approved"
      OR (
        "perfumes"."seasons" IS NOT NULL
        AND array_length("perfumes"."seasons", 1) > 0
        AND "perfumes"."sex" IS NOT NULL
        AND "perfumes"."description" != ''
      )
    ),
	CONSTRAINT "perfumes_seasons_limit_chk" CHECK (
        NOT "perfumes"."approved"
        OR
        array_length("perfumes"."seasons", 1) <= 4
      )
);
--> statement-breakpoint
CREATE TABLE "shop_compounds" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shop_compounds_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"compound_id" integer NOT NULL,
	"shop_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_staff" (
	"shop_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "staff_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shops_staff_shop_user_pk" PRIMARY KEY("shop_id","user_id")
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
	CONSTRAINT "shops_name_uq" UNIQUE("name")
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
	CONSTRAINT "users_username_uq" UNIQUE("username"),
	CONSTRAINT "users_email_uq" UNIQUE("email"),
	CONSTRAINT "users_phone_uq" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agings" ADD CONSTRAINT "agings_lot_id_shop_compound_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."shop_compound_lots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agings" ADD CONSTRAINT "agings_alcohol_id_alcohols_id_fk" FOREIGN KEY ("alcohol_id") REFERENCES "public"."alcohols"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agings" ADD CONSTRAINT "agings_lot_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."shop_compound_lots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agings" ADD CONSTRAINT "agings_alcohol_fk" FOREIGN KEY ("alcohol_id") REFERENCES "public"."alcohols"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_fk" FOREIGN KEY ("alcohol_id") REFERENCES "public"."alcohols"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "alcohols_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bottles" ADD CONSTRAINT "bottles_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bottles_lots" ADD CONSTRAINT "btls_lots_bottle_fk" FOREIGN KEY ("bottle_id") REFERENCES "public"."bottles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ADD CONSTRAINT "comp_lots_shop_comp_id_fk" FOREIGN KEY ("shop_compound_id") REFERENCES "public"."shop_compounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_compound_lots" ADD CONSTRAINT "comp_lots_alcohol_id_fk" FOREIGN KEY ("alcohol_id") REFERENCES "public"."alcohols"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "pc_perfume_fk" FOREIGN KEY ("perfume_id") REFERENCES "public"."perfumes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "pc_company_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_compounds" ADD CONSTRAINT "shop_comps_compound_fk" FOREIGN KEY ("compound_id") REFERENCES "public"."perfumes_compounds"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_compounds" ADD CONSTRAINT "shop_comps_shop_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_staff" ADD CONSTRAINT "shops_staff_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_staff" ADD CONSTRAINT "shops_staff_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_owner_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "shop_comps_compound_shop_uq" ON "shop_compounds" USING btree ("compound_id","shop_id");