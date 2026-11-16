-- Migrazione: Aggiunta valore 'collaborator' all'enum user_role
-- Permette la gestione di collaboratori esterni limitati alla sola chat/canali autorizzati

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'collaborator'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'collaborator';
  END IF;
END $$;
