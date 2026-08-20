-- ==============================================================================
-- AGGIORNAMENTO PERMESSI RLS PER TASKS E PROJECTS (KANBAN BOARD)
-- ==============================================================================

-- 1. Permetti lettura e scrittura pubblica/autenticata per Tasks
DROP POLICY IF EXISTS "Team members full access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Permetti full access tasks" ON public.tasks;

CREATE POLICY "Permetti full access tasks"
ON public.tasks
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 2. Permetti lettura e scrittura pubblica/autenticata per Projects
DROP POLICY IF EXISTS "Team members full access to projects" ON public.projects;
DROP POLICY IF EXISTS "Permetti full access projects" ON public.projects;

CREATE POLICY "Permetti full access projects"
ON public.projects
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
