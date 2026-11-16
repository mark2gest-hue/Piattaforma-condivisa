-- Migrazione Fase 2 Chat: Thread, Reazioni e Tracciamento Letture Canale

-- 1. Supporto nativo per thread di risposta in public.messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON public.messages(parent_message_id);

-- 2. Tabella dedicata per le reazioni emoji (opzionale/strutturata per query relazionali)
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON public.message_reactions(user_id);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read reactions"
  ON public.message_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to manage own reactions"
  ON public.message_reactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on message_reactions"
  ON public.message_reactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Tabella per i badge non letti canale (last_read_at)
CREATE TABLE IF NOT EXISTS public.user_channel_reads (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, channel)
);

ALTER TABLE public.user_channel_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view own channel reads"
  ON public.user_channel_reads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to upsert own channel reads"
  ON public.user_channel_reads FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on user_channel_reads"
  ON public.user_channel_reads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
