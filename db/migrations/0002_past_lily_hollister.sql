ALTER TABLE "alcohol_lots" RENAME COLUMN "receivedAt" TO "received_at";--> statement-breakpoint
ALTER TABLE "alcohol_lots" DROP CONSTRAINT "lot_is_already_exist";--> statement-breakpoint
ALTER TABLE "alcohol_lots" ADD CONSTRAINT "lot_is_already_exist" UNIQUE("amount","received_at","cost_per_liter");