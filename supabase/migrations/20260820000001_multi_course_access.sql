-- ==============================================================================
-- SCHEMA SUPPORTO MULTI-CORSO & LIVELLI DI ACCESSO (AI Start & AI Pro)
-- ==============================================================================

-- 1. Aggiunta della colonna access_tier (ai-start, ai-pro, both)
ALTER TABLE public.student_codes 
ADD COLUMN IF NOT EXISTS access_tier TEXT NOT NULL DEFAULT 'ai-start';

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_student_codes_tier ON public.student_codes(access_tier);

-- 2. Aggiornamento della funzione RPC per la verifica dei codici con livello di accesso
DROP FUNCTION IF EXISTS public.verify_student_code(TEXT);

CREATE OR REPLACE FUNCTION public.verify_student_code(input_code TEXT)
RETURNS TABLE (
  id UUID,
  code TEXT,
  student_name TEXT,
  student_email TEXT,
  course_title TEXT,
  completed_lessons INTEGER,
  is_active BOOLEAN,
  access_tier TEXT
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id, 
    sc.code, 
    sc.student_name, 
    sc.student_email, 
    sc.course_title, 
    sc.completed_lessons, 
    sc.is_active,
    sc.access_tier
  FROM public.student_codes sc
  WHERE sc.code = input_code AND sc.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Concedi permessi di esecuzione
GRANT EXECUTE ON FUNCTION public.verify_student_code(TEXT) TO anon, authenticated;
