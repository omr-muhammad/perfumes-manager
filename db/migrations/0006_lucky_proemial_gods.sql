ALTER TABLE "addresses" ALTER COLUMN "street" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "street" SET NOT NULL;