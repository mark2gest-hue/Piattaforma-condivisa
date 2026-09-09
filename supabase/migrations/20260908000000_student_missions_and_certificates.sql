-- ==============================================================================
-- MIGRAZIONE: STUDENT MISSIONS & ATTESTATI FORMATIVI (LABORATORIO DIDATTICO MIRA)
-- Isolamento assoluto per studente e differenziazione per tier (ai-start vs ai-pro)
-- ==============================================================================

-- 1. TABELLA STUDENT MISSIONS (Zona Compiti & Missioni Guidate)
CREATE TABLE IF NOT EXISTS public.student_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_email TEXT NOT NULL,
    student_name TEXT NOT NULL DEFAULT 'Studente',
    course_tier TEXT NOT NULL DEFAULT 'ai-start' CHECK (course_tier IN ('ai-start', 'ai-pro')),
    mission_id INT NOT NULL CHECK (mission_id >= 1 AND mission_id <= 5),
    mission_title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    student_submission TEXT,
    score INT CHECK (score >= 0 AND score <= 100),
    mira_feedback JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_student_mission UNIQUE (student_email, course_tier, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_student_missions_email ON public.student_missions(student_email);
CREATE INDEX IF NOT EXISTS idx_student_missions_user_id ON public.student_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_student_missions_tier ON public.student_missions(course_tier);
CREATE INDEX IF NOT EXISTS idx_student_missions_status ON public.student_missions(status);

ALTER TABLE public.student_missions ENABLE ROW LEVEL SECURITY;

-- Politiche RLS
DROP POLICY IF EXISTS "Lettura missioni proprie o admin" ON public.student_missions;
CREATE POLICY "Lettura missioni proprie o admin"
ON public.student_missions FOR SELECT TO authenticated
USING (
    user_id = auth.uid() 
    OR student_email = (auth.jwt() ->> 'email')
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
);

DROP POLICY IF EXISTS "Aggiornamento missioni proprie o admin" ON public.student_missions;
CREATE POLICY "Aggiornamento missioni proprie o admin"
ON public.student_missions FOR ALL TO authenticated
USING (
    user_id = auth.uid() 
    OR student_email = (auth.jwt() ->> 'email')
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
);

-- 2. TABELLA STUDENT CERTIFICATES (Attestati Ufficiali di Completamento)
CREATE TABLE IF NOT EXISTS public.student_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_code TEXT NOT NULL UNIQUE,
    student_email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    course_tier TEXT NOT NULL CHECK (course_tier IN ('ai-start', 'ai-pro')),
    average_score INT NOT NULL CHECK (average_score >= 0 AND average_score <= 100),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT uq_student_certificate UNIQUE (student_email, course_tier)
);

CREATE INDEX IF NOT EXISTS idx_student_certificates_code ON public.student_certificates(certificate_code);
CREATE INDEX IF NOT EXISTS idx_student_certificates_email ON public.student_certificates(student_email);

ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lettura certificati autenticati" ON public.student_certificates;
CREATE POLICY "Lettura certificati autenticati"
ON public.student_certificates FOR SELECT TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Scrittura certificati riservata admin" ON public.student_certificates;
CREATE POLICY "Scrittura certificati riservata admin"
ON public.student_certificates FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
);
