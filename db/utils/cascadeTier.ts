import { sql } from "drizzle-orm";

const cascadeOnDelete = `
  CREATE OR REPLACE FUNCTION validate_tier_entity_id()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
      DECLARE
        v_ent_type TEXT := CASE TG_TABLE_NAME 
          WHEN 'alcohols' THEN 'alcohol' 
          WHEN 'bottles' THEN 'bottle' 
          WHEN 'perfumes_compounds' THEN 'compound' 
        END;

      BEGIN
        DELETE FROM amount_tiers AS tiers WHERE OLD.id = tiers.entity_id AND tiers.entity_type = v_ent_type;

        RETURN OLD;
      END;
    $$;
`;

export const amountTiersTriggers = sql.raw(`
  ${cascadeOnDelete}

  CREATE OR REPLACE TRIGGER tgr_alco_cascade_delete
  BEFORE DELETE ON alcohols
  FOR EACH ROW EXECUTE FUNCTION validate_tier_entity_id();

  CREATE OR REPLACE TRIGGER tgr_btl_cascade_delete
  BEFORE DELETE ON bottles
  FOR EACH ROW EXECUTE FUNCTION validate_tier_entity_id();

  CREATE OR REPLACE TRIGGER tgr_comp_cascade_delete
  BEFORE DELETE ON perfumes_compounds
  FOR EACH ROW EXECUTE FUNCTION validate_tier_entity_id();
`);
