-- ==============================================================================
-- Migrazione: Aggiunta flag reminder_sent a calendar_events
-- ==============================================================================

ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_calendar_events_reminder 
ON public.calendar_events(event_date, reminder_sent);
