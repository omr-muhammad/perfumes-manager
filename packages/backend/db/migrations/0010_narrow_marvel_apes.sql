ALTER TABLE "perfumes" DROP CONSTRAINT "perfumes_approved_chk";--> statement-breakpoint
ALTER TABLE "perfumes" ADD CONSTRAINT "perfumes_approved_chk" CHECK (
      NOT "perfumes"."approved"
      OR (
        "perfumes"."seasons" IS NOT NULL
        AND array_length("perfumes"."seasons", 1) > 0
        AND "perfumes"."sex" IS NOT NULL
        AND "perfumes"."description_en" != ''
        AND "perfumes"."description_ar" != ''
      )
    );