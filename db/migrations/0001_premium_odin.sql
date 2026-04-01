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
	"strict" varchar(50) DEFAULT '',
	"street" varchar(50) DEFAULT '',
	"buildingNumber" smallint,
	"notes" text DEFAULT '',
	"shopId" integer,
	"userId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "addresses_shopId_unique" UNIQUE("shopId"),
	CONSTRAINT "addresses_userId_unique" UNIQUE("userId"),
	CONSTRAINT "address_must_refer_to_shop_or_user" CHECK (
      COALESCE("addresses"."userId"::BOOLEAN::INTEGER, 0) 
      +
      COALESCE("addresses"."shopId"::BOOLEAN::INTEGER, 0) 
      = 1
    )
);
--> statement-breakpoint
CREATE TABLE "aging" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "aging_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" integer NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"compoundId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "aging_amount_startDate_endDate_compoundId_unique" UNIQUE("amount","startDate","endDate","compoundId"),
	CONSTRAINT "amount_must_be_positive" CHECK (
        "aging"."amount" > 0
      )
);
--> statement-breakpoint
CREATE TABLE "alcohols" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "alcohols_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"amountInMl" integer DEFAULT 0 NOT NULL,
	"ltBuyPrice" numeric(4, 4) NOT NULL,
	"ltSellPrice" numeric(4, 4) NOT NULL,
	"unitSellPrice" numeric(2, 2) NOT NULL,
	"unit" varchar(2) DEFAULT 'ml' NOT NULL,
	"concentration" smallint DEFAULT 96,
	"madeDate" timestamp NOT NULL,
	"expiryDate" timestamp NOT NULL,
	"shopId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alcohols_name_type_ltBuyPrice_concentration_shopId_madeDate_unique" UNIQUE("name","type","ltBuyPrice","concentration","shopId","madeDate"),
	CONSTRAINT "amount_cannot_be_negative" CHECK ("alcohols"."amountInMl" >= 0),
	CONSTRAINT "buying_price_must_be_more_than_zero" CHECK ("alcohols"."ltBuyPrice" > 0),
	CONSTRAINT "selling_price_must_be_more_than_zero" CHECK ("alcohols"."ltSellPrice" > 0),
	CONSTRAINT "unit_price_must_be_more_than_zero" CHECK ("alcohols"."unitSellPrice" > 0),
	CONSTRAINT "concentration_must_be_between_1_and_100" CHECK ("alcohols"."concentration" > 0 AND "alcohols"."concentration" <= 100),
	CONSTRAINT "expiry_date_must_be_greater_than_made_date" CHECK ("alcohols"."madeDate" < "alcohols"."expiryDate")
);
--> statement-breakpoint
CREATE TABLE "bottles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bottles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50),
	"type" "bottle_type" NOT NULL,
	"size" smallint NOT NULL,
	"category" "bottle_category" NOT NULL,
	"price" numeric(3, 3) NOT NULL,
	"img" text,
	"shopId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
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
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_name_country_unique" UNIQUE("name","country"),
	CONSTRAINT "approved_required_completed_info" CHECK (
      NOT "companies"."approved"
        OR
      "companies"."country" IS NOT NULL
    )
);
--> statement-breakpoint
CREATE TABLE "perfumes_compounds" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "perfumes_compounds_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"oilAmountInMl" integer DEFAULT 0 NOT NULL,
	"sprayAmountInMl" integer DEFAULT 0 NOT NULL,
	"concentration" smallint,
	"code" varchar(50) NOT NULL,
	"perfumeId" integer NOT NULL,
	"companyId" integer NOT NULL,
	"shopId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "perfumes_compounds_perfumeId_companyId_shopId_code_unique" UNIQUE("perfumeId","companyId","shopId","code"),
	CONSTRAINT "oil_amount_cannot_be_negative" CHECK (
      "perfumes_compounds"."oilAmountInMl" >= 0
    ),
	CONSTRAINT "oil_or_spray_amount_must_be_provided" CHECK (
        "perfumes_compounds"."oilAmountInMl" + "perfumes_compounds"."sprayAmountInMl" > 1
      ),
	CONSTRAINT "spray_amount_cannot_be_negative" CHECK (
      "perfumes_compounds"."sprayAmountInMl" >= 0
    ),
	CONSTRAINT "concentration_required_for_spray" CHECK (
        "perfumes_compounds"."sprayAmountInMl" = 0
        OR (
          "perfumes_compounds"."concentration" > 0
          AND
          "perfumes_compounds"."concentration" < 100
        )
      )
);
--> statement-breakpoint
CREATE TABLE "shop_staff" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shop_staff_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"shopId" integer NOT NULL,
	"userId" integer NOT NULL,
	"role" "staff_role" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shop_staff_shopId_userId_unique" UNIQUE("shopId","userId")
);
--> statement-breakpoint
CREATE TABLE "shops" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shops_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"ownerId" integer NOT NULL,
	"logo" text DEFAULT '',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
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
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "perfumes" ALTER COLUMN "id" SET GENERATED ALWAYS;--> statement-breakpoint
ALTER TABLE "perfumes" ADD COLUMN "seasons" "seasons"[];--> statement-breakpoint
ALTER TABLE "perfumes" ADD COLUMN "sex" "sex";--> statement-breakpoint
ALTER TABLE "perfumes" ADD COLUMN "description" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "perfumes" ADD COLUMN "approved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "perfumes" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "perfumes" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_shopId_shops_id_fk" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aging" ADD CONSTRAINT "aging_compoundId_perfumes_compounds_id_fk" FOREIGN KEY ("compoundId") REFERENCES "public"."perfumes_compounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "alcohols_shopId_shops_id_fk" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bottles" ADD CONSTRAINT "bottles_shopId_shops_id_fk" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "perfumes_compounds_perfumeId_perfumes_id_fk" FOREIGN KEY ("perfumeId") REFERENCES "public"."perfumes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "perfumes_compounds_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "perfumes_compounds_shopId_shops_id_fk" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_staff" ADD CONSTRAINT "shop_staff_shopId_shops_id_fk" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_staff" ADD CONSTRAINT "shop_staff_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes" ADD CONSTRAINT "approved_requires_completed_info" CHECK (
      NOT "perfumes"."approved"
      OR (
        "perfumes"."seasons" IS NOT NULL
        AND array_length("perfumes"."seasons", 1) > 0
        AND "perfumes"."sex" IS NOT NULL
        AND "perfumes"."description" != ''
      )
    );--> statement-breakpoint
ALTER TABLE "perfumes" ADD CONSTRAINT "seasons_array_cannot_exceed_four" CHECK (
        NOT "perfumes"."approved"
        OR
        array_length("perfumes"."seasons", 1) <= 4
      );