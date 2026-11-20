-- Fix regressione RLS: include il ruolo 'member' (usato dai membri interni del team)
-- e ripristina il controllo is_active = true nella funzione helper is_team_member().

CREATE OR REPLACE FUNCTION public.is_team_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('admin', 'dev', 'member', 'collaborator')
  );
$$;
