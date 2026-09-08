ALTER TABLE "companies" RENAME COLUMN "country" TO "hq_country_code";--> statement-breakpoint
ALTER TABLE "companies" DROP CONSTRAINT "companies_uq";--> statement-breakpoint
ALTER TABLE "companies" DROP CONSTRAINT "companies_approved_chk";--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_uq" UNIQUE("name","hq_country_code");--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_approved_chk" CHECK (
      NOT "companies"."approved"
        OR
      "companies"."hq_country_code" IS NOT NULL
    );