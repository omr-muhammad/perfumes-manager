ALTER TABLE "amount_tiers" DROP CONSTRAINT "amount_tiers_entity_id_perfumes_compounds_id_fk";
--> statement-breakpoint
ALTER TABLE "amount_tiers" ALTER COLUMN "entity_id" DROP NOT NULL;