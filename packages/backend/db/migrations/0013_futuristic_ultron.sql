ALTER TABLE "companies" DROP CONSTRAINT "companies_approved_chk";--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "hq_country_code" SET NOT NULL;