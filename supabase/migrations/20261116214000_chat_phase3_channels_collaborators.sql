-- Migrazione Fase 3: Canali Dinamici e Privati per la Chat di Team

CREATE TABLE IF NOT EXISTS public.chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  member_ids UUID[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_chat_channels_name ON public.chat_channels(name);
CREATE INDEX IF NOT EXISTS idx_chat_channels_private ON public.chat_channels(is_private);

ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;

-- Canali pubblici: visibili a tutti gli utenti autenticati del team
CREATE POLICY "Public channels visible to authenticated users"
  ON public.chat_channels FOR SELECT
  TO authenticated
  USING (
    is_private = false
    OR auth.uid() = ANY(member_ids)
    OR auth.uid() = created_by
  );

-- Creazione canali consentita agli utenti autenticati
CREATE POLICY "Authenticated users can create channels"
  ON public.chat_channels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Modifica o eliminazione riservata al creatore o service role
CREATE POLICY "Channel creator can update channels"
  ON public.chat_channels FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Channel creator can delete channels"
  ON public.chat_channels FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Accesso totale per service_role
CREATE POLICY "Service role full access on chat_channels"
  ON public.chat_channels FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
