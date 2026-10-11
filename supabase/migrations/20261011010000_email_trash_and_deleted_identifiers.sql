-- ==============================================================================
-- Migrazione: Supporto Cestino (Soft-Delete) & Blacklist Message-ID Eliminati
-- ==============================================================================

-- 1. Aggiunta valore 'trash' all'enum email_status se non esiste già
DO $$
BEGIN
    ALTER TYPE email_status ADD VALUE IF NOT EXISTS 'trash';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabella per tracciare i message_id eliminati definitivamente (Anti-Reimport da Aruba IMAP)
CREATE TABLE IF NOT EXISTS public.deleted_email_identifiers (
    message_id TEXT PRIMARY KEY,
    mailbox_email TEXT,
    deleted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_deleted_email_identifiers_created_at 
ON public.deleted_email_identifiers(created_at DESC);

-- 3. RLS per deleted_email_identifiers
ALTER TABLE public.deleted_email_identifiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can access deleted email identifiers" ON public.deleted_email_identifiers;
CREATE POLICY "Team members can access deleted email identifiers" 
ON public.deleted_email_identifiers 
FOR ALL TO authenticated 
USING (public.is_team_member()) 
WITH CHECK (public.is_team_member());

-- Permesso di lettura/scrittura anche alle funzioni di servizio (anon/authenticated se necessario per cron)
DROP POLICY IF EXISTS "Service role / API full access to deleted email identifiers" ON public.deleted_email_identifiers;
CREATE POLICY "Service role / API full access to deleted email identifiers" 
ON public.deleted_email_identifiers 
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);
