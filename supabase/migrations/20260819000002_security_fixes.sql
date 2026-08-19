-- ------------------------------------------------------------------------------
-- 1. MODIFICA POLICY DI SICUREZZA PER STUDENT_CODES
-- ------------------------------------------------------------------------------

-- Rimuoviamo la policy che permetteva a chiunque di scaricare tutti i codici
DROP POLICY IF EXISTS "Allow public select for student codes" ON public.student_codes;

-- Rimuoviamo la vecchia policy FULL access ad authenticated generico
DROP POLICY IF EXISTS "Allow authenticated full access student codes" ON public.student_codes;

-- Consentiamo l'accesso completo in lettura/scrittura su student_codes SOLO ai membri attivi del team
CREATE POLICY "Team members full access student codes"
  ON public.student_codes
  FOR ALL
  TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

-- ------------------------------------------------------------------------------
-- 2. FUNZIONE RPC SICURA PER LA VERIFICA DEI CODICI DA PARTE DI UTENTI ANONIMI
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.verify_student_code(input_code TEXT)
RETURNS TABLE (
  id UUID,
  code TEXT,
  student_name TEXT,
  student_email TEXT,
  course_title TEXT,
  completed_lessons INTEGER,
  is_active BOOLEAN
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT sc.id, sc.code, sc.student_name, sc.student_email, sc.course_title, sc.completed_lessons, sc.is_active
  FROM public.student_codes sc
  WHERE sc.code = input_code AND sc.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Concediamo l'esecuzione della RPC anche ad anon e authenticated
GRANT EXECUTE ON FUNCTION public.verify_student_code(TEXT) TO anon, authenticated;
