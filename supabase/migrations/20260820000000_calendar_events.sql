-- ==============================================================================
-- SCHEMA CALENDARIO EVENTI CONDIVISI (Piattaforma Team)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT DEFAULT '09:00',
  category TEXT NOT NULL DEFAULT 'task',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indici per performance di ricerca per data
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_category ON public.calendar_events(category);

-- Abilitazione RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select calendar events"
  ON public.calendar_events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow all manage calendar events"
  ON public.calendar_events FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
