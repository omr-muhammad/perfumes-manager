CREATE TYPE "public"."bottle_category" AS ENUM('normal', 'elegant');--> statement-breakpoint
CREATE TYPE "public"."bottle_type" AS ENUM('spray', 'oil', 'tester');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('ar', 'en');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'owner', 'staff', 'customer');--> statement-breakpoint
CREATE TYPE "public"."seasons" AS ENUM('winter', 'spring', 'summer', 'fall');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('men', 'women', 'unisex');--> statement-breakpoint
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
CREATE TABLE "aging" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "aging_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"compound_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "duplicate_entry" UNIQUE("amount","start_date","end_date","compound_id"),
	CONSTRAINT "amount_must_be_positive" CHECK (
        "aging"."amount" > 0
      )
);
--> statement-breakpoint
CREATE TABLE "alcohols" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "alcohols_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"amount_in_ml" integer DEFAULT 0 NOT NULL,
	"lt_buy_price" numeric(5, 2) NOT NULL,
	"lt_sell_price" numeric(5, 2) NOT NULL,
	"unit_sell_price" numeric(5, 2) NOT NULL,
	"concentration" smallint DEFAULT 96,
	"expiry_date" timestamp NOT NULL,
	"shop_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alcohol_must_be_unique" UNIQUE("name","type","lt_buy_price","concentration","shop_id"),
	CONSTRAINT "amount_cannot_be_negative" CHECK ("alcohols"."amount_in_ml" >= 0),
	CONSTRAINT "buying_price_must_be_more_than_zero" CHECK ("alcohols"."lt_buy_price" > 0),
	CONSTRAINT "selling_price_must_be_more_than_zero" CHECK ("alcohols"."lt_sell_price" > 0),
	CONSTRAINT "unit_price_must_be_more_than_zero" CHECK ("alcohols"."unit_sell_price" > 0),
	CONSTRAINT "concentration_must_be_between_1_and_100" CHECK ("alcohols"."concentration" > 0 AND "alcohols"."concentration" <= 100),
	CONSTRAINT "selling_price_cannot_be_less_than_buying_price" CHECK (
        "alcohols"."lt_sell_price" >= "alcohols"."lt_buy_price"
      )
);
--> statement-breakpoint
CREATE TABLE "bottles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bottles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"type" "bottle_type" NOT NULL,
	"size" smallint NOT NULL,
	"category" "bottle_category" NOT NULL,
	"price" numeric(5, 2) NOT NULL,
	"img" text,
	"shop_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "name_must_be_unique" UNIQUE("name"),
	CONSTRAINT "bottle_size_must_be_positive" CHECK (
      "bottles"."size" > 0
    ),
	CONSTRAINT "bottle_price_must_be_positive" CHECK (
      "bottles"."price" > 0
    )
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "companies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"country" varchar(50),
	"approved" boolean DEFAULT false,
	"logo" text DEFAULT '',
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
CREATE TABLE "perfumes_compounds" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "perfumes_compounds_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"perfume_name" varchar(100) NOT NULL,
	"company_name" varchar(100) NOT NULL,
	"oil_amount_in_ml" integer DEFAULT 0 NOT NULL,
	"spray_amount_in_ml" integer DEFAULT 0 NOT NULL,
	"concentration" smallint,
	"kilo_buy_price" numeric(15, 4) NOT NULL,
	"kilo_sell_price" numeric(15, 4) NOT NULL,
	"ml_price" numeric(10, 4) NOT NULL,
	"code" varchar(50) NOT NULL,
	"perfume_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"shop_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "duplicate_compound" UNIQUE("perfume_id","company_id","shop_id","code"),
	CONSTRAINT "ml_price_cannot_be_negative" CHECK (
        "perfumes_compounds"."ml_price" > 0
      ),
	CONSTRAINT "kilo_prices_cannot_be_negative" CHECK (
        "perfumes_compounds"."kilo_buy_price" > 0 AND "perfumes_compounds"."kilo_sell_price" > 0
      ),
	CONSTRAINT "oil_amount_cannot_be_negative" CHECK (
      "perfumes_compounds"."oil_amount_in_ml" >= 0
    ),
	CONSTRAINT "oil_or_spray_amount_must_be_provided" CHECK (
        "perfumes_compounds"."oil_amount_in_ml" + "perfumes_compounds"."spray_amount_in_ml" > 1
      ),
	CONSTRAINT "spray_amount_cannot_be_negative" CHECK (
      "perfumes_compounds"."spray_amount_in_ml" >= 0
    ),
	CONSTRAINT "concentration_required_for_spray" CHECK (
        "perfumes_compounds"."spray_amount_in_ml" = 0
        OR (
          "perfumes_compounds"."concentration" > 0
          AND
          "perfumes_compounds"."concentration" < 100
        )
      )
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
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shop_staff_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"shop_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "staff_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "duplicate_staff" UNIQUE("shop_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "shops" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shops_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"owner_id" integer NOT NULL,
	"logo" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shops_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(200) NOT NULL,
	"role" "role" DEFAULT 'customer' NOT NULL,
	"language" "language" DEFAULT 'ar',
	"phone" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aging" ADD CONSTRAINT "aging_compound_id_perfumes_compounds_id_fk" FOREIGN KEY ("compound_id") REFERENCES "public"."perfumes_compounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "alcohols_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bottles" ADD CONSTRAINT "bottles_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "perfumes_compounds_perfume_id_perfumes_id_fk" FOREIGN KEY ("perfume_id") REFERENCES "public"."perfumes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "perfumes_compounds_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "perfumes_compounds_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_staff" ADD CONSTRAINT "shop_staff_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_staff" ADD CONSTRAINT "shop_staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;