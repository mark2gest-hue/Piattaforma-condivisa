-- Migrazione Fase 5: Inbox Assistenza Nativa (Studenti & Aziende B2B) + Web Push per Studenti

-- 1. Tabella Ticket Assistenza
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_type TEXT NOT NULL DEFAULT 'student' CHECK (requester_type IN ('student', 'b2b')),
  student_id TEXT NOT NULL,
  student_code TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  company_name TEXT,
  course_id TEXT,
  lesson_id INTEGER,
  lesson_title TEXT,
  category TEXT NOT NULL DEFAULT 'tecnico' CHECK (category IN ('tecnico', 'didattica', 'commerciale')),
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved')),
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_name TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  student_last_read_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  staff_last_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_student_id ON public.support_tickets(student_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_student_code ON public.support_tickets(student_code);
CREATE INDEX IF NOT EXISTS idx_support_tickets_last_msg ON public.support_tickets(last_message_at DESC);

-- 2. Tabella Messaggi dei Ticket Assistenza
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'staff', 'system')),
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON public.support_messages(ticket_id, created_at ASC);

-- 3. Estensione push_subscriptions per supportare anche studenti ('student-<id>')
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'push_subscriptions'
  ) THEN
    DROP POLICY IF EXISTS "Users can select own push subscriptions" ON public.push_subscriptions;
    DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
    DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
    DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;

    FOR fk_name IN
      SELECT tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = 'push_subscriptions'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    LOOP
      EXECUTE format('ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS %I', fk_name);
    END LOOP;

    ALTER TABLE public.push_subscriptions
      ALTER COLUMN user_id TYPE TEXT USING user_id::text;

    CREATE POLICY "Users can select own push subscriptions"
      ON public.push_subscriptions
      FOR SELECT
      TO authenticated
      USING (auth.uid()::text = user_id);

    CREATE POLICY "Users can insert own push subscriptions"
      ON public.push_subscriptions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid()::text = user_id);

    CREATE POLICY "Users can update own push subscriptions"
      ON public.push_subscriptions
      FOR UPDATE
      TO authenticated
      USING (auth.uid()::text = user_id)
      WITH CHECK (auth.uid()::text = user_id);

    CREATE POLICY "Users can delete own push subscriptions"
      ON public.push_subscriptions
      FOR DELETE
      TO authenticated
      USING (auth.uid()::text = user_id);
  END IF;
END $$;

-- 4. Sicurezza RLS su support_tickets e support_messages
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Internal team full access on support_tickets" ON public.support_tickets;
CREATE POLICY "Internal team full access on support_tickets"
  ON public.support_tickets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND COALESCE(p.role::text, '') <> 'collaborator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND COALESCE(p.role::text, '') <> 'collaborator'
    )
  );

DROP POLICY IF EXISTS "Service role full access on support_tickets" ON public.support_tickets;
CREATE POLICY "Service role full access on support_tickets"
  ON public.support_tickets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Internal team full access on support_messages" ON public.support_messages;
CREATE POLICY "Internal team full access on support_messages"
  ON public.support_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND COALESCE(p.role::text, '') <> 'collaborator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND COALESCE(p.role::text, '') <> 'collaborator'
    )
  );

DROP POLICY IF EXISTS "Service role full access on support_messages" ON public.support_messages;
CREATE POLICY "Service role full access on support_messages"
  ON public.support_messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Abilitazione Supabase Realtime per aggiornamenti istantanei
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;
