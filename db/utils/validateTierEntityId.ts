import { sql } from "drizzle-orm";

const fkRefCheck = `
  CREATE OR REPLACE FUNCTION validate_tier_entity_id()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
    BEGIN
      IF New.entity_type NOT IN ('alcohol', 'bottle', 'compound') 
        THEN
          RAISE EXCEPTION 'Unknown entity_type: %', NEW.entity_type USING ERRCODE = 'U0001';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM alcohols WHERE id = NEW.entity_id AND entity_type = 'alcohol'
        UNION ALL
        SELECT 1 FROM bottles WHERE id = NEW.entity_id AND entity_type = 'bottle'
        UNION ALL
        SELECT 1 FROM perfumes_compounds WHERE id = NEW.entity_id AND entity_type = 'compound'
      ) THEN
        RAISE EXCEPTION 'Invalid ref: % with id: % not found', New.entity_type, New.entity_id USING ERRCODE = 'U0001';
      END IF;

      RETURN NEW;
    END;
  $$;
`;

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
  ${fkRefCheck}
  
  ${cascadeOnDelete}

  CREATE OR REPLACE TRIGGER check_fk_reference
  BEFORE INSERT ON amount_tiers
  FOR EACH ROW EXECUTE FUNCTION validate_tier_entity_id();  

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
