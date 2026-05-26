ALTER TABLE "compound_lots" DROP CONSTRAINT "compound_lots_compound_id_perfumes_compounds_id_fk";
--> statement-breakpoint
ALTER TABLE "compound_lots" ADD CONSTRAINT "compound_lots_compound_id_perfumes_compounds_id_fk" FOREIGN KEY ("compound_id") REFERENCES "public"."perfumes_compounds"("id") ON DELETE cascade ON UPDATE no action;