-- ==============================================================================
-- MIGRAZIONE: CORSI AZIENDALI B2B (STANZE PRIVATE, MODULI BASE & VIDEO CUSTOM)
-- ==============================================================================

-- 1. TABELLA COHORT / AZIENDE (Stanze Private B2B)
CREATE TABLE IF NOT EXISTS public.corporate_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    company_code_prefix TEXT NOT NULL UNIQUE, -- es. 'ROSSI', 'ACME' per codici tipo 'AI-ROSSI-01'
    logo_url TEXT,
    base_track TEXT NOT NULL DEFAULT 'ai-start', -- 'ai-start' | 'ai-pro' | 'both' | 'custom_only'
    allowed_standard_modules JSONB DEFAULT '[]'::jsonb, -- Se vuoto o null, eredita tutti i moduli del track
    custom_welcome_message TEXT,
    contact_person_name TEXT,
    contact_person_email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_corporate_cohorts_prefix ON public.corporate_cohorts(company_code_prefix);
ALTER TABLE public.corporate_cohorts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permetti lettura cohorts a tutti per verifica accesso" ON public.corporate_cohorts;
CREATE POLICY "Permetti lettura cohorts a tutti per verifica accesso"
ON public.corporate_cohorts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permetti gestione cohorts ad autenticati" ON public.corporate_cohorts;
CREATE POLICY "Permetti gestione cohorts ad autenticati"
ON public.corporate_cohorts FOR ALL TO authenticated USING (true);


-- 2. TABELLA LEZIONI & VIDEO PERSONALIZZATI PER AZIENDA
CREATE TABLE IF NOT EXISTS public.corporate_custom_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID NOT NULL REFERENCES public.corporate_cohorts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    instructor_name TEXT NOT NULL DEFAULT 'Team Aiutiamoci', -- es. 'Marco & Lorenzo' o 'Docente Ospite: Ing. Rossi'
    video_url TEXT NOT NULL, -- MP4 diretto, Vimeo, YouTube unlisted, Loom
    duration TEXT NOT NULL DEFAULT '15:00',
    description TEXT,
    resources_pdf_url TEXT,
    dedicated_prompts JSONB DEFAULT '[]'::jsonb, -- Prompts calibrati sull'azienda
    order_index INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_corporate_lessons_cohort ON public.corporate_custom_lessons(cohort_id);
ALTER TABLE public.corporate_custom_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permetti lettura lezioni custom per verifica" ON public.corporate_custom_lessons;
CREATE POLICY "Permetti lettura lezioni custom per verifica"
ON public.corporate_custom_lessons FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permetti gestione lezioni custom ad autenticati" ON public.corporate_custom_lessons;
CREATE POLICY "Permetti gestione lezioni custom ad autenticati"
ON public.corporate_custom_lessons FOR ALL TO authenticated USING (true);


-- 3. AGGIORNAMENTO TABELLA STUDENT_CODES (Collego opzionalmente lo studente all'Azienda/Cohort)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'student_codes' 
        AND column_name = 'cohort_id'
    ) THEN
        ALTER TABLE public.student_codes 
        ADD COLUMN cohort_id UUID REFERENCES public.corporate_cohorts(id) ON DELETE SET NULL;
        
        CREATE INDEX IF NOT EXISTS idx_student_codes_cohort_id ON public.student_codes(cohort_id);
    END IF;
END $$;
