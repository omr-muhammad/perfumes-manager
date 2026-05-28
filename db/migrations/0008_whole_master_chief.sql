ALTER TABLE "agings" DROP CONSTRAINT "duplicate_entry";--> statement-breakpoint
ALTER TABLE "alcohol_lots" DROP CONSTRAINT "alcohol_lots_key";--> statement-breakpoint
ALTER TABLE "alcohols" DROP CONSTRAINT "alcohol_must_be_unique";--> statement-breakpoint
ALTER TABLE "bottles" DROP CONSTRAINT "duplicate_bottle";--> statement-breakpoint
ALTER TABLE "companies" DROP CONSTRAINT "company_name_and_country_must_be_unique";--> statement-breakpoint
ALTER TABLE "perfumes_compounds" DROP CONSTRAINT "duplicate_compound";--> statement-breakpoint
ALTER TABLE "perfumes" DROP CONSTRAINT "perfumes_name_unique";--> statement-breakpoint
ALTER TABLE "shops" DROP CONSTRAINT "shops_name_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "username_must_be_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_phone_unique";--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "address_must_refer_to_shop_or_user";--> statement-breakpoint
ALTER TABLE "agings" DROP CONSTRAINT "amount_must_be_positive";--> statement-breakpoint
ALTER TABLE "agings" DROP CONSTRAINT "invalid_concnetration_range";--> statement-breakpoint
ALTER TABLE "alcohol_lots" DROP CONSTRAINT "alcohol_lots_cost_per_liter_base_sell_per_liter_chk";--> statement-breakpoint
ALTER TABLE "alcohol_lots" DROP CONSTRAINT "alcohol_lots_amount_remaining_amount_chk";--> statement-breakpoint
ALTER TABLE "alcohol_lots" DROP CONSTRAINT "alcohol_lots_remaining_amount_chk";--> statement-breakpoint
ALTER TABLE "alcohols" DROP CONSTRAINT "concentration_must_be_between_1_and_100";--> statement-breakpoint
ALTER TABLE "amount_tiers" DROP CONSTRAINT "value_cannot_be_negative";--> statement-breakpoint
ALTER TABLE "amount_tiers" DROP CONSTRAINT "discount_fields_must_match_pricing_type";--> statement-breakpoint
ALTER TABLE "amount_tiers" DROP CONSTRAINT "discount_percentage_cannot_go_over_100";--> statement-breakpoint
ALTER TABLE "bottles" DROP CONSTRAINT "bottle_size_must_be_positive";--> statement-breakpoint
ALTER TABLE "bottles_lots" DROP CONSTRAINT "btl_lots_price_pos_chk";--> statement-breakpoint
ALTER TABLE "bottles_lots" DROP CONSTRAINT "bottles_lots_remaining_stock_pos_chk";--> statement-breakpoint
ALTER TABLE "companies" DROP CONSTRAINT "approved_required_completed_info";--> statement-breakpoint
ALTER TABLE "perfumes" DROP CONSTRAINT "approved_requires_completed_info";--> statement-breakpoint
ALTER TABLE "perfumes" DROP CONSTRAINT "seasons_array_cannot_exceed_four";--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_shop_id_shops_id_fk";
--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "alcohol_lots" DROP CONSTRAINT "alcohol_lots_alcohol_id_alcohols_id_fk";
--> statement-breakpoint
ALTER TABLE "alcohols" DROP CONSTRAINT "alcohols_shop_id_shops_id_fk";
--> statement-breakpoint
ALTER TABLE "amount_tiers" DROP CONSTRAINT "amount_tiers_shop_id_shops_id_fk";
--> statement-breakpoint
ALTER TABLE "bottles" DROP CONSTRAINT "bottles_shop_id_shops_id_fk";
--> statement-breakpoint
ALTER TABLE "bottles_lots" DROP CONSTRAINT "bottles_lots_bottle_id_bottles_id_fk";
--> statement-breakpoint
ALTER TABLE "perfumes_compounds" DROP CONSTRAINT "perfumes_compounds_perfume_id_perfumes_id_fk";
--> statement-breakpoint
ALTER TABLE "perfumes_compounds" DROP CONSTRAINT "perfumes_compounds_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "perfumes_compounds" DROP CONSTRAINT "perfumes_compounds_shop_id_shops_id_fk";
--> statement-breakpoint
ALTER TABLE "shop_staff" DROP CONSTRAINT "shop_staff_shop_id_shops_id_fk";
--> statement-breakpoint
ALTER TABLE "shop_staff" DROP CONSTRAINT "shop_staff_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "shops" DROP CONSTRAINT "shops_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "shop_staff" DROP CONSTRAINT "id";--> statement-breakpoint
ALTER TABLE "shop_staff" ADD CONSTRAINT "shops_staff_shop_user_pk" PRIMARY KEY("shop_id","user_id");--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agings" ADD CONSTRAINT "agings_lot_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."compound_lots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agings" ADD CONSTRAINT "agings_alcohol_fk" FOREIGN KEY ("alcohol_id") REFERENCES "public"."alcohols"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_fk" FOREIGN KEY ("alcohol_id") REFERENCES "public"."alcohols"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "alcohols_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bottles" ADD CONSTRAINT "bottles_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bottles_lots" ADD CONSTRAINT "btls_lots_bottle_fk" FOREIGN KEY ("bottle_id") REFERENCES "public"."bottles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "pc_perfume_fk" FOREIGN KEY ("perfume_id") REFERENCES "public"."perfumes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "pc_company_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "pc_shop_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_staff" ADD CONSTRAINT "shops_staff_shop_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_staff" ADD CONSTRAINT "shops_staff_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_owner_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "amount_tiers" DROP COLUMN "shop_id";--> statement-breakpoint
ALTER TABLE "agings" ADD CONSTRAINT "agings_uq" UNIQUE("amount","start_date","end_date","lot_id");--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_uq" UNIQUE("amountInMl","received_at","cost_per_liter");--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "alcohols_uq" UNIQUE("name","type","concentration","shop_id");--> statement-breakpoint
ALTER TABLE "bottles" ADD CONSTRAINT "bottles_uq" UNIQUE("shop_id","sku");--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_uq" UNIQUE("name","country");--> statement-breakpoint
ALTER TABLE "perfumes_compounds" ADD CONSTRAINT "pc_uq" UNIQUE("perfume_id","company_id","shop_id","code");--> statement-breakpoint
ALTER TABLE "perfumes" ADD CONSTRAINT "perfumes_uq" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_name_uq" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_uq" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_uq" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_uq" UNIQUE("phone");--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_shop_or_user_fk" CHECK (
      COALESCE("addresses"."user_id"::BOOLEAN::INTEGER, 0) 
      +
      COALESCE("addresses"."shop_id"::BOOLEAN::INTEGER, 0) 
      = 1
    );--> statement-breakpoint
ALTER TABLE "agings" ADD CONSTRAINT "agings_amount_pos_chk" CHECK (
        "agings"."amount" > 0
      );--> statement-breakpoint
ALTER TABLE "agings" ADD CONSTRAINT "agings_concentration_range_chk" CHECK (
        "agings"."concentration" BETWEEN 1 AND 100
      );--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_cost_lte_base_chk" CHECK (
    "alcohol_lots"."cost_per_liter" <=   "alcohol_lots"."base_sell_per_liter"
  );--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_amounts_nneg_chk" CHECK (
      "alcohol_lots"."remaining_amount" >= 0 AND "alcohol_lots"."amountInMl" >= 0 
    );--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_remaining_lte_amount_chk" CHECK (
      "alcohol_lots"."remaining_amount" <= "alcohol_lots"."amountInMl"  
    );--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "alcohol_lots_expiry_date_future_chk" CHECK (
        "alcohol_lots"."expiry_date" > NOW()
      );--> statement-breakpoint
ALTER TABLE "alcohols" ADD CONSTRAINT "alcohols_concentration_range_chk" CHECK ("alcohols"."concentration" > 0 AND "alcohols"."concentration" <= 100);--> statement-breakpoint
ALTER TABLE "amount_tiers" ADD CONSTRAINT "amount_tiers_value_pos_chk" CHECK (
      "amount_tiers"."value" >= 0
    );--> statement-breakpoint
ALTER TABLE "amount_tiers" ADD CONSTRAINT "amount_tiers_discount_price_type_cons_chk" CHECK (
        (
          "amount_tiers"."pricing_type" = 'fixed' AND 
          "amount_tiers"."discount_type" IS NULL AND 
          "amount_tiers"."max_discount_amount" IS NULL
        )
        OR
        ("amount_tiers"."pricing_type" = 'discount' AND "amount_tiers"."discount_type" IS NOT NULL)
      );--> statement-breakpoint
ALTER TABLE "amount_tiers" ADD CONSTRAINT "amount_tiers_discount_percentage_range_chk" CHECK (
      "amount_tiers"."pricing_type" != 'discount'
      OR
      "amount_tiers"."discount_type" = 'fixed'
      OR
      "amount_tiers"."value" BETWEEN 0 AND 100 -- pricing type is discount and discount type is percentage
    );--> statement-breakpoint
ALTER TABLE "bottles" ADD CONSTRAINT "bottles_size_pos_chk" CHECK (
      "bottles"."size" > 0
    );--> statement-breakpoint
ALTER TABLE "bottles_lots" ADD CONSTRAINT "btl_lots_price_nneg_chk" CHECK (
        "bottles_lots"."buy_price" >= 0 AND "bottles_lots"."price" >= 0
      );--> statement-breakpoint
ALTER TABLE "bottles_lots" ADD CONSTRAINT "bottles_lots_stocks_nneg_chk" CHECK (
        "bottles_lots"."stock" >= 0 AND "bottles_lots"."remaining_stock" >= 0
      );--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_approved_chk" CHECK (
      NOT "companies"."approved"
        OR
      "companies"."country" IS NOT NULL
    );--> statement-breakpoint
ALTER TABLE "perfumes" ADD CONSTRAINT "perfumes_approved_chk" CHECK (
      NOT "perfumes"."approved"
      OR (
        "perfumes"."seasons" IS NOT NULL
        AND array_length("perfumes"."seasons", 1) > 0
        AND "perfumes"."sex" IS NOT NULL
        AND "perfumes"."description" != ''
      )
    );--> statement-breakpoint
ALTER TABLE "perfumes" ADD CONSTRAINT "perfumes_seasons_limit_chk" CHECK (
        NOT "perfumes"."approved"
        OR
        array_length("perfumes"."seasons", 1) <= 4
      );