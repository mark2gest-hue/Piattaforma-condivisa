-- Migrazione: Supporto Agenti AI e Tracciamento Esecuzioni Task (Human-in-the-Loop)

-- 1. Estensione tabella profiles per supportare agenti virtuali
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_agent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS agent_model TEXT DEFAULT 'nvidia/nemotron-3-ultra-550b-a55b',
ADD COLUMN IF NOT EXISTS agent_system_prompt TEXT DEFAULT 'Sei un agente operativo AI specializzato nel supportare il team. Analizza i task assegnati, genera soluzioni concrete, bozze di testo o codice e prepara il lavoro per la revisione del team.';

-- 2. Creazione tabella per le esecuzioni dell'agente (Audit & Human-in-the-Loop)
CREATE TABLE IF NOT EXISTS public.task_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_sent TEXT NOT NULL,
  output_response TEXT,
  tokens_used INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'success', 'failed', 'approved', 'rejected'
  user_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_task_agent_runs_task_id ON public.task_agent_runs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_agent_runs_agent_id ON public.task_agent_runs(agent_id);

-- 3. RLS per task_agent_runs
ALTER TABLE public.task_agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utenti autenticati possono leggere le esecuzioni dei task"
ON public.task_agent_runs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Utenti autenticati possono inserire o aggiornare esecuzioni"
ON public.task_agent_runs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Creazione utente agente in auth.users (per soddisfare il vincolo foreign key)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'nemotron.agent@system.local',
  crypt('agent_secure_pass_123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Nemotron Lead Agent"}',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed del profilo Agente in public.profiles
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  is_active,
  is_agent,
  agent_model,
  agent_system_prompt
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'nemotron.agent@system.local',
  'Nemotron Lead Agent',
  'dev',
  true,
  true,
  'nvidia/nemotron-3-ultra-550b-a55b',
  'Sei un agente operativo AI specializzato nel completare compiti aziendali, produrre bozze, analisi e codice ad alta precisione.'
)
ON CONFLICT (id) DO UPDATE SET
  is_agent = true,
  agent_model = EXCLUDED.agent_model,
  agent_system_prompt = EXCLUDED.agent_system_prompt;
