-- Migrazione pulizia profili chat: rimozione pentest79456, flag is_agent su Nemotron e nomi reali soci

DO $$
BEGIN
  -- 1. Rimozione eventuale account di test pentest79456
  DELETE FROM public.profiles
  WHERE COALESCE(full_name, '') ILIKE '%pentest%'
     OR COALESCE(email, '') ILIKE '%pentest%';

  DELETE FROM auth.users
  WHERE COALESCE(email, '') ILIKE '%pentest%'
     OR COALESCE(raw_user_meta_data->>'full_name', '') ILIKE '%pentest%';

  -- 2. Assicura is_agent = true per Nemotron Lead Agent (visibile in /lavori, escluso da /chat)
  UPDATE public.profiles
  SET is_agent = true
  WHERE COALESCE(full_name, '') ILIKE '%nemotron%'
     OR COALESCE(email, '') ILIKE '%nemotron%';

  -- 3. Normalizzazione nomi reali dei soci in public.profiles
  UPDATE public.profiles
  SET full_name = 'Marco'
  WHERE COALESCE(full_name, '') ILIKE '%gerelmo%'
     OR COALESCE(email, '') ILIKE '%gerelmo%';

  UPDATE public.profiles
  SET full_name = 'Lorenzo'
  WHERE COALESCE(full_name, '') ILIKE '%lorenzolodi%'
     OR COALESCE(email, '') ILIKE '%lorenzo%';

  UPDATE public.profiles
  SET full_name = 'Stefano'
  WHERE COALESCE(full_name, '') ILIKE '%malaisi%'
     OR COALESCE(full_name, '') ILIKE '%maraisi%'
     OR COALESCE(email, '') ILIKE '%malaisi%'
     OR COALESCE(email, '') ILIKE '%maraisi%'
     OR COALESCE(email, '') ILIKE '%stefano%';

  -- 4. Allineamento full_name anche nei metadati auth.users
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{full_name}', '"Marco"'::jsonb)
  WHERE COALESCE(email, '') ILIKE '%gerelmo%'
     OR COALESCE(raw_user_meta_data->>'full_name', '') ILIKE '%gerelmo%';

  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{full_name}', '"Lorenzo"'::jsonb)
  WHERE COALESCE(email, '') ILIKE '%lorenzo%'
     OR COALESCE(raw_user_meta_data->>'full_name', '') ILIKE '%lorenzolodi%';

  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{full_name}', '"Stefano"'::jsonb)
  WHERE COALESCE(email, '') ILIKE '%malaisi%'
     OR COALESCE(email, '') ILIKE '%maraisi%'
     OR COALESCE(email, '') ILIKE '%stefano%'
     OR COALESCE(raw_user_meta_data->>'full_name', '') ILIKE '%malaisi%'
     OR COALESCE(raw_user_meta_data->>'full_name', '') ILIKE '%maraisi%';
END $$;
