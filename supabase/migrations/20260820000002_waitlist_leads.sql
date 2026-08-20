-- ==============================================================================
-- TABELLA LISTA D'ATTESA (WAITLIST LEADS) PER CORSI IN PREPARAZIONE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  course_interest TEXT NOT NULL DEFAULT 'AI Pro - Automazioni & Agenti',
  converted_to_student BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indici per lookup rapido
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_email ON public.waitlist_leads(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_converted ON public.waitlist_leads(converted_to_student);

-- Abilitazione Row Level Security
ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

-- 1. Permesso di inserimento pubblico (anon per chi si iscrive da landing)
CREATE POLICY "Permetti iscrizione waitlist da landing"
ON public.waitlist_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Permesso di lettura solo per utenti autenticati (admin e team)
CREATE POLICY "Permetti lettura waitlist a utenti autenticati"
ON public.waitlist_leads
FOR SELECT
TO authenticated
USING (true);

-- 3. Permesso di modifica solo per utenti autenticati (conversione lead)
CREATE POLICY "Permetti modifica waitlist a utenti autenticati"
ON public.waitlist_leads
FOR UPDATE
TO authenticated
USING (true);
