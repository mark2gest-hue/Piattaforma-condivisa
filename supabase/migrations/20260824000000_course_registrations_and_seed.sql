-- ==============================================================================
-- MIGRAZIONE CONSOLIDATA: TABELLE CORSI, REGISTRAZIONI & IMPORT DATI STORICI (29 ISCRITTI)
-- ==============================================================================

-- 1. TABELLA STUDENT CODES
CREATE TABLE IF NOT EXISTS public.student_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    course_title TEXT NOT NULL DEFAULT 'AI Start: Domina l''IA da Zero',
    access_tier TEXT NOT NULL DEFAULT 'ai-start',
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_student_codes_code ON public.student_codes(code);
CREATE INDEX IF NOT EXISTS idx_student_codes_email ON public.student_codes(student_email);
ALTER TABLE public.student_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permetti lettura codici a utenti anonimi per verifica" ON public.student_codes;
CREATE POLICY "Permetti lettura codici a utenti anonimi per verifica"
ON public.student_codes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permetti modifica codici ad autenticati" ON public.student_codes;
CREATE POLICY "Permetti modifica codici ad autenticati"
ON public.student_codes FOR ALL TO authenticated USING (true);


-- 2. TABELLA REGISTRAZIONI CORSI (QUESTIONARIO & APPROVAZIONI)
CREATE TABLE IF NOT EXISTS public.course_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    ai_experience TEXT,
    objective TEXT,
    blocker TEXT,
    expectation TEXT,
    raw_answers JSONB,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    access_code TEXT,
    approved BOOLEAN NOT NULL DEFAULT false,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_course_reg_email ON public.course_registrations(email);
CREATE INDEX IF NOT EXISTS idx_course_reg_status ON public.course_registrations(status);
CREATE INDEX IF NOT EXISTS idx_course_reg_created_at ON public.course_registrations(created_at DESC);
ALTER TABLE public.course_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permetti inserimento pubblico registrazioni" ON public.course_registrations;
CREATE POLICY "Permetti inserimento pubblico registrazioni"
ON public.course_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permetti lettura registrazioni a utenti autenticati" ON public.course_registrations;
CREATE POLICY "Permetti lettura registrazioni a utenti autenticati"
ON public.course_registrations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permetti modifica registrazioni a utenti autenticati" ON public.course_registrations;
CREATE POLICY "Permetti modifica registrazioni a utenti autenticati"
ON public.course_registrations FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Permetti eliminazione registrazioni a utenti autenticati" ON public.course_registrations;
CREATE POLICY "Permetti eliminazione registrazioni a utenti autenticati"
ON public.course_registrations FOR DELETE TO authenticated USING (true);


-- 3. TABELLA LISTA D'ATTESA (WAITLIST LEADS)
CREATE TABLE IF NOT EXISTS public.waitlist_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    course_interest TEXT NOT NULL DEFAULT 'AI Pro - Automazioni & Agenti',
    converted_to_student BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_waitlist_leads_email ON public.waitlist_leads(email);
ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permetti inserimento pubblico waitlist" ON public.waitlist_leads;
CREATE POLICY "Permetti inserimento pubblico waitlist"
ON public.waitlist_leads FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permetti gestione waitlist a utenti autenticati" ON public.waitlist_leads;
CREATE POLICY "Permetti gestione waitlist a utenti autenticati"
ON public.waitlist_leads FOR ALL TO authenticated USING (true);



-- ==============================================================================
-- 4. INSERIMENTO 29 ISCRITTI STORICI E RELATIVI CODICI DI ACCESSO
-- ==============================================================================

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Lorenzo Lodi',
  'lorenzolodi66@gmail.com',
  'Li uso ogni giorno',
  'Migliorare il lavoro o il business',
  'Non ottengo risultati utili',
  'Voglio risultati pratici subito',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non ottengo risultati utili","mindset":"Voglio risultati pratici subito","experience":"Li uso ogni giorno"}'::jsonb,
  'approved',
  'AI-8QASM3',
  true,
  '2026-05-02T20:21:07.154Z',
  '2026-05-01T06:23:48.550Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-8QASM3',
  'Lorenzo Lodi',
  'lorenzolodi66@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-01T06:23:48.550Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'GIAN LUCA PACCHIEGA',
  'gpacchio85@gmail.com',
  'Li uso abbastanza spesso',
  'Migliorare il lavoro o il business',
  'Non capisco come usarla nel mio lavoro',
  'Voglio risultati pratici subito',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non capisco come usarla nel mio lavoro","mindset":"Voglio risultati pratici subito","experience":"Li uso abbastanza spesso"}'::jsonb,
  'approved',
  'AI-H9DUX2',
  true,
  '2026-05-03T16:17:21.563Z',
  '2026-05-03T12:52:57.096Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-H9DUX2',
  'GIAN LUCA PACCHIEGA',
  'gpacchio85@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-03T12:52:57.096Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Stefania Bragazzi',
  'stefbra1967@gmail.com',
  'Mai',
  'Trovare idee e fare brainstorming',
  'Non so da dove iniziare',
  'Voglio imparare le basi con calma',
  '{"goal":"Trovare idee e fare brainstorming","blocker":"Non so da dove iniziare","mindset":"Voglio imparare le basi con calma","experience":"Mai"}'::jsonb,
  'approved',
  'AI-AVE4PC',
  true,
  '2026-05-03T16:17:19.268Z',
  '2026-05-03T13:10:43.919Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-AVE4PC',
  'Stefania Bragazzi',
  'stefbra1967@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-03T13:10:43.919Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Vincenzo',
  'personale.vincenzo@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Migliorare il lavoro o il business',
  'Non capisco come usarla nel mio lavoro',
  'Voglio sperimentare e capire',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non capisco come usarla nel mio lavoro","mindset":"Voglio sperimentare e capire","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-PFQ3N2',
  true,
  '2026-05-03T16:17:18.442Z',
  '2026-05-03T14:16:05.220Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-PFQ3N2',
  'Vincenzo',
  'personale.vincenzo@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-03T14:16:05.220Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Deborah Vico',
  'info@musica.it',
  'Mai',
  'Migliorare il lavoro o il business',
  'Non so da dove iniziare',
  'Voglio sperimentare e capire',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non so da dove iniziare","mindset":"Voglio sperimentare e capire","experience":"Mai"}'::jsonb,
  'approved',
  'AI-FF5E8Q',
  true,
  '2026-05-03T16:17:17.718Z',
  '2026-05-03T14:56:52.918Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-FF5E8Q',
  'Deborah Vico',
  'info@musica.it',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-03T14:56:52.918Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Marzia Foraboschi',
  'foraboschi.marzia@outlook.it',
  'Li uso abbastanza spesso',
  'Scrivere testi e contenuti',
  'Ho paura di usarla male',
  'Voglio imparare le basi con calma',
  '{"goal":"Scrivere testi e contenuti","blocker":"Ho paura di usarla male","mindset":"Voglio imparare le basi con calma","experience":"Li uso abbastanza spesso"}'::jsonb,
  'approved',
  'AI-PP83TL',
  true,
  '2026-05-04T04:40:04.459Z',
  '2026-05-03T17:05:37.915Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-PP83TL',
  'Marzia Foraboschi',
  'foraboschi.marzia@outlook.it',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-03T17:05:37.915Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'lorenzo',
  'lovalore@gmail.com',
  'Mai',
  'Migliorare il lavoro o il business',
  'Non so da dove iniziare',
  'Voglio sperimentare e capire',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non so da dove iniziare","mindset":"Voglio sperimentare e capire","experience":"Mai"}'::jsonb,
  'approved',
  'AI-MMZJRG',
  true,
  '2026-05-04T04:40:06.029Z',
  '2026-05-03T19:04:54.964Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-MMZJRG',
  'lorenzo',
  'lovalore@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-03T19:04:54.964Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Alessandra Spinozzi',
  'alelibera22@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Migliorare il lavoro o il business',
  'Non capisco come usarla nel mio lavoro',
  'Voglio sperimentare e capire',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non capisco come usarla nel mio lavoro","mindset":"Voglio sperimentare e capire","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-CEK2PU',
  true,
  '2026-05-04T04:40:06.973Z',
  '2026-05-03T19:58:10.196Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-CEK2PU',
  'Alessandra Spinozzi',
  'alelibera22@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-03T19:58:10.196Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Alberto Ganda',
  'alberto.ganda@gmail.com',
  'Li uso ogni giorno',
  'Trovare idee e fare brainstorming',
  'Ho paura di usarla male',
  'Voglio sperimentare e capire',
  '{"goal":"Trovare idee e fare brainstorming","blocker":"Ho paura di usarla male","mindset":"Voglio sperimentare e capire","experience":"Li uso ogni giorno"}'::jsonb,
  'approved',
  'AI-93PKVS',
  true,
  '2026-05-04T06:01:37.450Z',
  '2026-05-04T05:12:25.588Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-93PKVS',
  'Alberto Ganda',
  'alberto.ganda@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-04T05:12:25.588Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'rita benini',
  'beninirita@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Migliorare il lavoro o il business',
  'Non capisco come usarla nel mio lavoro',
  'Voglio sperimentare e capire',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non capisco come usarla nel mio lavoro","mindset":"Voglio sperimentare e capire","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-MQ3LCM',
  true,
  '2026-05-04T06:01:36.291Z',
  '2026-05-04T05:12:40.227Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-MQ3LCM',
  'rita benini',
  'beninirita@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-04T05:12:40.227Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Fabrizio Barbieri',
  'fabry1965.fb@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Altro',
  'Non so da dove iniziare',
  'Voglio imparare le basi con calma',
  '{"goal":"Altro","blocker":"Non so da dove iniziare","mindset":"Voglio imparare le basi con calma","goalOther":"Che mi aiuti a fare un entrata per riuscire a migliorare un po'' la mia vita","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-D8K9UJ',
  true,
  '2026-05-04T06:01:34.940Z',
  '2026-05-04T05:16:16.555Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-D8K9UJ',
  'Fabrizio Barbieri',
  'fabry1965.fb@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-04T05:16:16.555Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Rossella Righini',
  'rossella945@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Scrivere testi e contenuti',
  'Non so da dove iniziare',
  'Voglio sperimentare e capire',
  '{"goal":"Scrivere testi e contenuti","blocker":"Non so da dove iniziare","mindset":"Voglio sperimentare e capire","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-ZEZSNA',
  true,
  '2026-05-04T06:01:34.008Z',
  '2026-05-04T05:17:01.226Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-ZEZSNA',
  'Rossella Righini',
  'rossella945@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-04T05:17:01.226Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Luigi',
  'macone99@libero.it',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Scrivere testi e contenuti',
  'Non ho tempo',
  'Voglio sperimentare e capire',
  '{"goal":"Scrivere testi e contenuti","blocker":"Non ho tempo","mindset":"Voglio sperimentare e capire","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-P77M98',
  true,
  '2026-05-04T06:01:33.076Z',
  '2026-05-04T05:28:54.873Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-P77M98',
  'Luigi',
  'macone99@libero.it',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-04T05:28:54.873Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Pino Tateo',
  'pinotateo@libero.it',
  'Li uso abbastanza spesso',
  'Trovare idee e fare brainstorming',
  'Ho paura di usarla male',
  'Voglio sperimentare e capire',
  '{"goal":"Trovare idee e fare brainstorming","blocker":"Ho paura di usarla male","mindset":"Voglio sperimentare e capire","experience":"Li uso abbastanza spesso"}'::jsonb,
  'approved',
  'AI-63NLAU',
  true,
  '2026-05-04T07:29:55.590Z',
  '2026-05-04T07:20:56.087Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-63NLAU',
  'Pino Tateo',
  'pinotateo@libero.it',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-04T07:20:56.087Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Marco Valesani',
  'marcovalesani@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Migliorare il lavoro o il business',
  'Non capisco come usarla nel mio lavoro',
  'Voglio sperimentare e capire',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non capisco come usarla nel mio lavoro","mindset":"Voglio sperimentare e capire","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-3TW5AJ',
  true,
  '2026-05-04T09:03:52.060Z',
  '2026-05-04T08:05:39.614Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-3TW5AJ',
  'Marco Valesani',
  'marcovalesani@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-04T08:05:39.614Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Mahmoud El abed',
  'moudi_a11@hotmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Trovare idee e fare brainstorming',
  'Non so da dove iniziare',
  'Voglio imparare le basi con calma',
  '{"goal":"Trovare idee e fare brainstorming","blocker":"Non so da dove iniziare","mindset":"Voglio imparare le basi con calma","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-LTZNY4',
  true,
  '2026-05-04T15:37:29.808Z',
  '2026-05-04T15:32:30.298Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-LTZNY4',
  'Mahmoud El abed',
  'moudi_a11@hotmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-04T15:32:30.298Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Stefano Fiore',
  'stefanogombi.fiore@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Altro',
  'Non capisco come usarla nel mio lavoro',
  'Voglio sperimentare e capire',
  '{"goal":"Altro","blocker":"Non capisco come usarla nel mio lavoro","mindset":"Voglio sperimentare e capire","goalOther":"Grafiche video scrivere contenuti trovare idee e immagini per il mio lavoro per migliorarlo","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-Q5KQ2V',
  true,
  '2026-05-04T17:11:46.293Z',
  '2026-05-04T16:09:01.624Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-Q5KQ2V',
  'Stefano Fiore',
  'stefanogombi.fiore@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-04T16:09:01.624Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Angelo Giovannardi',
  'a.giovannardi@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Migliorare il lavoro o il business',
  'Non capisco come usarla nel mio lavoro',
  'Voglio sperimentare e capire',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non capisco come usarla nel mio lavoro","mindset":"Voglio sperimentare e capire","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-MXJLEG',
  true,
  '2026-05-05T10:17:17.545Z',
  '2026-05-04T20:18:43.634Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-MXJLEG',
  'Angelo Giovannardi',
  'a.giovannardi@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-04T20:18:43.634Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Antonio Concina',
  'antonio.concina@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Migliorare il lavoro o il business',
  'Non capisco come usarla nel mio lavoro',
  'Voglio sperimentare e capire',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non capisco come usarla nel mio lavoro","mindset":"Voglio sperimentare e capire","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-7YDQVM',
  true,
  '2026-05-05T10:17:18.404Z',
  '2026-05-04T20:44:40.572Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-7YDQVM',
  'Antonio Concina',
  'antonio.concina@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-04T20:44:40.572Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Mari D Ambra',
  'dambramariella@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Scrivere testi e contenuti',
  'Non capisco come usarla nel mio lavoro',
  'Voglio sperimentare e capire',
  '{"goal":"Scrivere testi e contenuti","blocker":"Non capisco come usarla nel mio lavoro","mindset":"Voglio sperimentare e capire","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-GRWF3D',
  true,
  '2026-05-05T10:17:20.344Z',
  '2026-05-05T05:01:03.062Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-GRWF3D',
  'Mari D Ambra',
  'dambramariella@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-05T05:01:03.062Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'claudio fioretti',
  'clfioretti@gmail.com',
  'Li uso abbastanza spesso',
  'Migliorare il lavoro o il business',
  'Non capisco come usarla nel mio lavoro',
  'Voglio sperimentare e capire',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non capisco come usarla nel mio lavoro","mindset":"Voglio sperimentare e capire","experience":"Li uso abbastanza spesso"}'::jsonb,
  'approved',
  'AI-4AFH8M',
  true,
  '2026-05-06T07:16:01.811Z',
  '2026-05-06T03:00:02.892Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-4AFH8M',
  'claudio fioretti',
  'clfioretti@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-06T03:00:02.892Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Daniele',
  'danielepizzi@yahoo.it',
  'Li uso abbastanza spesso',
  'Migliorare il lavoro o il business',
  'Non capisco come usarla nel mio lavoro',
  'Voglio risultati pratici subito',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non capisco come usarla nel mio lavoro","mindset":"Voglio risultati pratici subito","experience":"Li uso abbastanza spesso"}'::jsonb,
  'approved',
  'AI-LFB4E4',
  true,
  '2026-05-07T08:53:38.791Z',
  '2026-05-07T04:55:07.096Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-LFB4E4',
  'Daniele',
  'danielepizzi@yahoo.it',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-07T04:55:07.096Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Nadia Corvini',
  'nadia.corvini67@gmail.com',
  'Mai',
  'Scrivere testi e contenuti',
  'Non so da dove iniziare',
  'Voglio imparare le basi con calma',
  '{"goal":"Scrivere testi e contenuti","blocker":"Non so da dove iniziare","mindset":"Voglio imparare le basi con calma","experience":"Mai"}'::jsonb,
  'approved',
  'AI-XAXJJX',
  true,
  '2026-05-07T14:29:13.686Z',
  '2026-05-07T14:10:23.687Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-XAXJJX',
  'Nadia Corvini',
  'nadia.corvini67@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-07T14:10:23.687Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'SONIA MARCHESI',
  'freedom.sonia@gmail.com',
  'Mai',
  'Trovare idee e fare brainstorming',
  'Non so da dove iniziare',
  'Voglio risultati pratici subito',
  '{"goal":"Trovare idee e fare brainstorming","blocker":"Non so da dove iniziare","mindset":"Voglio risultati pratici subito","experience":"Mai"}'::jsonb,
  'approved',
  'AI-WKV74T',
  true,
  '2026-05-08T05:50:58.629Z',
  '2026-05-08T05:30:42.270Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-WKV74T',
  'SONIA MARCHESI',
  'freedom.sonia@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-08T05:30:42.270Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'elena marfescu',
  'marlena69105@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Migliorare il lavoro o il business',
  'Non so da dove iniziare',
  'Voglio imparare le basi con calma',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non so da dove iniziare","mindset":"Voglio imparare le basi con calma","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-8GUECA',
  true,
  '2026-05-20T05:51:07.325Z',
  '2026-05-17T17:07:22.979Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-8GUECA',
  'elena marfescu',
  'marlena69105@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-17T17:07:22.979Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'elena marfescu',
  'marlena69105@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Migliorare il lavoro o il business',
  'Non so da dove iniziare',
  'Voglio imparare le basi con calma',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non so da dove iniziare","mindset":"Voglio imparare le basi con calma","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-8GUECA',
  true,
  '2026-05-20T05:28:55.774Z',
  '2026-05-17T17:38:34.085Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-8GUECA',
  'elena marfescu',
  'marlena69105@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-17T17:38:34.085Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Tiziano Bortot',
  'tiziano@bortot.consulting',
  'Li uso abbastanza spesso',
  'Migliorare il lavoro o il business',
  'Non capisco come usarla nel mio lavoro',
  'Voglio sperimentare e capire',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non capisco come usarla nel mio lavoro","mindset":"Voglio sperimentare e capire","experience":"Li uso abbastanza spesso"}'::jsonb,
  'approved',
  'AI-KVM6YA',
  true,
  '2026-05-26T17:00:09.294Z',
  '2026-05-26T16:43:20.909Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-KVM6YA',
  'Tiziano Bortot',
  'tiziano@bortot.consulting',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-05-26T16:43:20.909Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Grazia Consales',
  'consalesgrazia01@gmail.com',
  'Mai',
  'Migliorare il lavoro o il business',
  'Non so da dove iniziare',
  'Voglio sperimentare e capire',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non so da dove iniziare","mindset":"Voglio sperimentare e capire","experience":"Mai"}'::jsonb,
  'approved',
  'AI-9JC93H',
  true,
  '2026-06-04T19:02:38.160Z',
  '2026-06-04T12:34:10.170Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-9JC93H',
  'Grazia Consales',
  'consalesgrazia01@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-06-04T12:34:10.170Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.course_registrations (name, email, ai_experience, objective, blocker, expectation, raw_answers, status, access_code, approved, approved_at, created_at)
VALUES (
  'Toni Montanari',
  'toni.montanari.it@gmail.com',
  'Qualche prova (tipo ChatGPT ogni tanto)',
  'Migliorare il lavoro o il business',
  'Non so da dove iniziare',
  'Voglio sperimentare e capire',
  '{"goal":"Migliorare il lavoro o il business","blocker":"Non so da dove iniziare","mindset":"Voglio sperimentare e capire","experience":"Qualche prova (tipo ChatGPT ogni tanto)"}'::jsonb,
  'approved',
  'AI-URMXWD',
  true,
  '2026-06-10T17:37:24.514Z',
  '2026-06-10T08:34:30.075Z'
);

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active, created_at)
VALUES (
  'AI-URMXWD',
  'Toni Montanari',
  'toni.montanari.it@gmail.com',
  'AI Start: Domina l''IA da Zero',
  'ai-start',
  true,
  '2026-06-10T08:34:30.075Z'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.student_codes (code, student_name, student_email, course_title, access_tier, is_active)
VALUES 
  ('SUPERADMIN', 'Super Admin Team', 'team@aiutiamoci.cloud', 'Accesso Completo Piattaforma', 'both', true),
  ('LMS', 'Team LMS', 'info@aiutiamoci.cloud', 'Accesso Completo Piattaforma', 'both', true),
  ('DEMO2026', 'Utente Demo', 'demo@aiutiamoci.cloud', 'AI Start: Domina l''IA da Zero', 'ai-start', true)
ON CONFLICT (code) DO NOTHING;
