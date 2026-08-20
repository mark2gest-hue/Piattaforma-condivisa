-- ==============================================================================
-- INSERIMENTO PROGETTI PREDEFINITI NELLA TABELLA PROJECTS
-- ==============================================================================

INSERT INTO public.projects (title, description, category, status)
VALUES 
  ('📘 Corsi Formativi (AI Start & AI Pro)', 'Gestione lezioni, materiali, registrazioni e corsisti.', 'internal', 'active'),
  ('💼 Consulenza B2B & Clienti', 'Progetti personalizzati, offerte e integrazioni aziendali.', 'internal', 'active'),
  ('🤖 Sviluppo Agenti AI & Automazioni', 'Creazione flussi n8n, webhook e bot intelligenti.', 'internal', 'active')
ON CONFLICT DO NOTHING;
