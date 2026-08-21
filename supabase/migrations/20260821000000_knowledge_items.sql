-- ==============================================================================
-- TABELLA KNOWLEDGE_ITEMS (Secondo Cervello / Prompt Library)
-- Creazione idempotente (eseguibile più volte senza errori)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.knowledge_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  category    TEXT        NOT NULL DEFAULT 'prompting',
  tags        TEXT[]      DEFAULT '{}',
  description TEXT,
  content     TEXT        NOT NULL DEFAULT '',
  lesson_id   INTEGER,
  is_featured BOOLEAN     DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indici per ricerche veloci
CREATE INDEX IF NOT EXISTS knowledge_items_category_idx ON public.knowledge_items(category);
CREATE INDEX IF NOT EXISTS knowledge_items_is_featured_idx ON public.knowledge_items(is_featured);

-- Commento tabella
COMMENT ON TABLE public.knowledge_items IS 'Knowledge base items for Secondo Cervello & Prompt Library';

-- Row Level Security
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;

-- Policy: tutti gli utenti autenticati possono leggere
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'knowledge_items' AND policyname = 'knowledge_items_select_authenticated'
  ) THEN
    CREATE POLICY knowledge_items_select_authenticated
      ON public.knowledge_items FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Policy: tutti gli utenti autenticati possono inserire
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'knowledge_items' AND policyname = 'knowledge_items_insert_authenticated'
  ) THEN
    CREATE POLICY knowledge_items_insert_authenticated
      ON public.knowledge_items FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Policy: tutti gli utenti autenticati possono eliminare
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'knowledge_items' AND policyname = 'knowledge_items_delete_authenticated'
  ) THEN
    CREATE POLICY knowledge_items_delete_authenticated
      ON public.knowledge_items FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Trigger aggiornamento updated_at
CREATE OR REPLACE FUNCTION public.update_knowledge_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS knowledge_items_updated_at_trigger ON public.knowledge_items;
CREATE TRIGGER knowledge_items_updated_at_trigger
  BEFORE UPDATE ON public.knowledge_items
  FOR EACH ROW EXECUTE FUNCTION public.update_knowledge_items_updated_at();
