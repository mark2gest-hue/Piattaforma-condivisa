-- Schema per i Codici di Accesso Studenti ed Avanzamento Corsi
CREATE TABLE IF NOT EXISTS public.student_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  course_title TEXT NOT NULL DEFAULT 'AI Start - Domina l''IA da Zero',
  completed_lessons INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Abilitazione RLS
ALTER TABLE public.student_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for student codes"
  ON public.student_codes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated full access student codes"
  ON public.student_codes FOR ALL
  TO authenticated
  USING (true);
