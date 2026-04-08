ALTER TABLE "bottles" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bottles" ADD CONSTRAINT "name_must_be_unique" UNIQUE("name");