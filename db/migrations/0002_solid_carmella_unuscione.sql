ALTER TABLE "addresses" RENAME COLUMN "buildingNumber" TO "building_number";--> statement-breakpoint
ALTER TABLE "addresses" RENAME COLUMN "shopId" TO "shop_id";--> statement-breakpoint
ALTER TABLE "addresses" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "addresses" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "addresses" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "aging" RENAME COLUMN "startDate" TO "start_date";--> statement-breakpoint
ALTER TABLE "aging" RENAME COLUMN "endDate" TO "end_date";--> statement-breakpoint
ALTER TABLE "aging" RENAME COLUMN "compoundId" TO "compound_id";--> statement-breakpoint
ALTER TABLE "aging" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "aging" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "alcohols" RENAME COLUMN "amountInMl" TO "amount_in_ml";--> statement-breakpoint
ALTER TABLE "alcohols" RENAME COLUMN "ltBuyPrice" TO "lt_buy_price";--> statement-breakpoint
ALTER TABLE "alcohols" RENAME COLUMN "ltSellPrice" TO "lt_sell_price";--> statement-breakpoint
ALTER TABLE "alcohols" RENAME COLUMN "unitSellPrice" TO "unit_sell_price";--> statement-breakpoint
ALTER TABLE "alcohols" RENAME COLUMN "madeDate" TO "made_date";--> statement-breakpoint
ALTER TABLE "alcohols" RENAME COLUMN "expiryDate" TO "expiry_date";--> statement-breakpoint
ALTER TABLE "alcohols" RENAME COLUMN "shopId" TO "shop_id";--> statement-breakpoint
ALTER TABLE "alcohols" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "alcohols" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "bottles" RENAME COLUMN "shopId" TO "shop_id";--> statement-breakpoint
ALTER TABLE "bottles" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "bottles" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "companies" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "companies" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "perfumes" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "perfumes" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" RENAME COLUMN "oilAmountInMl" TO "oil_amount_in_ml";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" RENAME COLUMN "sprayAmountInMl" TO "spray_amount_in_ml";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" RENAME COLUMN "perfumeId" TO "perfume_id";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" RENAME COLUMN "companyId" TO "company_id";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" RENAME COLUMN "shopId" TO "shop_id";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "shop_staff" RENAME COLUMN "shopId" TO "shop_id";--> statement-breakpoint
ALTER TABLE "shop_staff" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "shop_staff" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "shop_staff" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "shops" RENAME COLUMN "ownerId" TO "owner_id";--> statement-breakpoint
ALTER TABLE "shops" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "shops" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_shopId_unique";--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_userId_unique";--> statement-breakpoint
ALTER TABLE "aging" DROP CONSTRAINT "aging_amount_startDate_endDate_compoundId_unique";--> statement-breakpoint
ALTER TABLE "alcohols" DROP CONSTRAINT "alcohols_name_type_ltBuyPrice_concentration_shopId_madeDate_unique";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" DROP CONSTRAINT "perfumes_compounds_perfumeId_companyId_shopId_code_unique";--> statement-breakpoint
ALTER TABLE "shop_staff" DROP CONSTRAINT "shop_staff_shopId_userId_unique";--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "address_must_refer_to_shop_or_user";--> statement-breakpoint
ALTER TABLE "alcohols" DROP CONSTRAINT "amount_cannot_be_negative";--> statement-breakpoint
ALTER TABLE "alcohols" DROP CONSTRAINT "buying_price_must_be_more_than_zero";--> statement-breakpoint
ALTER TABLE "alcohols" DROP CONSTRAINT "selling_price_must_be_more_than_zero";--> statement-breakpoint
ALTER TABLE "alcohols" DROP CONSTRAINT "unit_price_must_be_more_than_zero";--> statement-breakpoint
ALTER TABLE "alcohols" DROP CONSTRAINT "expiry_date_must_be_greater_than_made_date";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" DROP CONSTRAINT "oil_amount_cannot_be_negative";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" DROP CONSTRAINT "oil_or_spray_amount_must_be_provided";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" DROP CONSTRAINT "spray_amount_cannot_be_negative";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" DROP CONSTRAINT "concentration_required_for_spray";--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_shopId_shops_id_fk";
--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "aging" DROP CONSTRAINT "aging_compoundId_perfumes_compounds_id_fk";
--> statement-breakpoint
ALTER TABLE "alcohols" DROP CONSTRAINT "alcohols_shopId_shops_id_fk";
--> statement-breakpoint
ALTER TABLE "bottles" DROP CONSTRAINT "bottles_shopId_shops_id_fk";
--> statement-breakpoint
ALTER TABLE "perfumes_compounds" DROP CONSTRAINT "perfumes_compounds_perfumeId_perfumes_id_fk";
--> statement-breakpoint
ALTER TABLE "perfumes_compounds" DROP CONSTRAINT "perfumes_compounds_companyId_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "perfumes_compounds" DROP CONSTRAINT "perfumes_compounds_shopId_shops_id_fk";
--> statement-breakpoint
ALTER TABLE "shop_staff" DROP CONSTRAINT "shop_staff_shopId_shops_id_fk";
--> statement-breakpoint
ALTER TABLE "shop_staff" DROP CONSTRAINT "shop_staff_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "shops" DROP CONSTRAINT "shops_ownerId_users_id_fk";
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
ALTER TABLE "shops" ADD CONSTRAINT "shops_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_shop_id_unique" UNIQUE("shop_id");--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "aging" ADD CONSTRAINT "duplicate_entry" UNIQUE("amount","start_date","end_date","compound_id");--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "alcohols_name_type_lt_buy_price_concentration_shop_id_made_date_unique" UNIQUE("name","type","lt_buy_price","concentration","shop_id","made_date");--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "duplicate_compound" UNIQUE("perfume_id","company_id","shop_id","code");--> statement-breakpoint
ALTER TABLE "shop_staff" ADD CONSTRAINT "duplicate_staff" UNIQUE("shop_id","user_id");--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "address_must_refer_to_shop_or_user" CHECK (
      COALESCE("addresses"."user_id"::BOOLEAN::INTEGER, 0) 
      +
      COALESCE("addresses"."shop_id"::BOOLEAN::INTEGER, 0) 
      = 1
    );--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "amount_cannot_be_negative" CHECK ("alcohols"."amount_in_ml" >= 0);--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "buying_price_must_be_more_than_zero" CHECK ("alcohols"."lt_buy_price" > 0);--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "selling_price_must_be_more_than_zero" CHECK ("alcohols"."lt_sell_price" > 0);--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "unit_price_must_be_more_than_zero" CHECK ("alcohols"."unit_sell_price" > 0);--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "expiry_date_must_be_greater_than_made_date" CHECK ("alcohols"."made_date" < "alcohols"."expiry_date");--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "oil_amount_cannot_be_negative" CHECK (
      "perfumes_compounds"."oil_amount_in_ml" >= 0
    );--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "oil_or_spray_amount_must_be_provided" CHECK (
        "perfumes_compounds"."oil_amount_in_ml" + "perfumes_compounds"."spray_amount_in_ml" > 1
      );--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "spray_amount_cannot_be_negative" CHECK (
      "perfumes_compounds"."spray_amount_in_ml" >= 0
    );--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "concentration_required_for_spray" CHECK (
        "perfumes_compounds"."spray_amount_in_ml" = 0
        OR (
          "perfumes_compounds"."concentration" > 0
          AND
          "perfumes_compounds"."concentration" < 100
        )
      );