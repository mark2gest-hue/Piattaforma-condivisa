-- ==============================================================================
-- MIGRAZIONE RBAC: Admin Delete & RLS Clienti / Team (Idempotente)
-- Ruoli:
--   - admin / dev: accesso completo + eliminazione definitiva (DELETE)
--   - member: accesso operativo interno (inclusi clients), NO DELETE definitivo
--   - collaborator: accesso limitato a workspace team (NO clients, NO DELETE)
-- ==============================================================================

-- 1. Helper Functions (SECURITY DEFINER, search_path bloccato su public)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('admin', 'dev')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_internal_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('admin', 'dev', 'member')
  );
$$;

-- 2. PUBLIC.CLIENTS (Accesso interno: admin/dev/member; DELETE solo admin/dev)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access to clients" ON public.clients;
DROP POLICY IF EXISTS "Internal members can select clients" ON public.clients;
DROP POLICY IF EXISTS "Internal members can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Internal members can update clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON public.clients;

CREATE POLICY "Internal members can select clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (public.is_internal_member());

CREATE POLICY "Internal members can insert clients"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (public.is_internal_member());

CREATE POLICY "Internal members can update clients"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (public.is_internal_member())
  WITH CHECK (public.is_internal_member());

CREATE POLICY "Admins can delete clients"
  ON public.clients FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 3. PUBLIC.TASKS (Team: SELECT/INSERT/UPDATE; DELETE solo admin/dev)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members full access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Permetti full access tasks" ON public.tasks;
DROP POLICY IF EXISTS "Team members can select tasks" ON public.tasks;
DROP POLICY IF EXISTS "Team members can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Team members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.tasks;

CREATE POLICY "Team members can select tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (public.is_team_member());

CREATE POLICY "Team members can insert tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "Team members can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "Admins can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4. PUBLIC.PROJECTS (Team: SELECT/INSERT/UPDATE; DELETE solo admin/dev)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members full access to projects" ON public.projects;
DROP POLICY IF EXISTS "Permetti full access projects" ON public.projects;
DROP POLICY IF EXISTS "Team members can select projects" ON public.projects;
DROP POLICY IF EXISTS "Team members can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Team members can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;

CREATE POLICY "Team members can select projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (public.is_team_member());

CREATE POLICY "Team members can insert projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "Team members can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 5. PUBLIC.CALENDAR_EVENTS (Team: SELECT/INSERT/UPDATE; DELETE solo admin/dev)
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all select calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow all manage calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Team members can select calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Team members can insert calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Team members can update calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admins can delete calendar events" ON public.calendar_events;

CREATE POLICY "Team members can select calendar events"
  ON public.calendar_events FOR SELECT
  TO authenticated
  USING (public.is_team_member());

CREATE POLICY "Team members can insert calendar events"
  ON public.calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "Team members can update calendar events"
  ON public.calendar_events FOR UPDATE
  TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "Admins can delete calendar events"
  ON public.calendar_events FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 6. PUBLIC.FILES & STORAGE.OBJECTS (team-files) (Team: SELECT/INSERT/UPDATE; DELETE solo admin/dev)
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members full access to files metadata" ON public.files;
DROP POLICY IF EXISTS "Team members can select files metadata" ON public.files;
DROP POLICY IF EXISTS "Team members can insert files metadata" ON public.files;
DROP POLICY IF EXISTS "Team members can update files metadata" ON public.files;
DROP POLICY IF EXISTS "Admins can delete files metadata" ON public.files;

CREATE POLICY "Team members can select files metadata"
  ON public.files FOR SELECT
  TO authenticated
  USING (public.is_team_member());

CREATE POLICY "Team members can insert files metadata"
  ON public.files FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "Team members can update files metadata"
  ON public.files FOR UPDATE
  TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "Admins can delete files metadata"
  ON public.files FOR DELETE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Team members can view storage files" ON storage.objects;
DROP POLICY IF EXISTS "Team members can upload storage files" ON storage.objects;
DROP POLICY IF EXISTS "Team members can update storage files" ON storage.objects;
DROP POLICY IF EXISTS "Team members can delete storage files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete storage files" ON storage.objects;

CREATE POLICY "Team members can view storage files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'team-files' AND public.is_team_member());

CREATE POLICY "Team members can upload storage files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'team-files' AND public.is_team_member());

CREATE POLICY "Team members can update storage files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'team-files' AND public.is_team_member())
  WITH CHECK (bucket_id = 'team-files' AND public.is_team_member());

CREATE POLICY "Admins can delete storage files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'team-files' AND public.is_admin());

-- 7. PUBLIC.KNOWLEDGE_ITEMS (DELETE ristretto a admin/dev)
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users to delete knowledge items" ON public.knowledge_items;
DROP POLICY IF EXISTS "knowledge_items_delete_authenticated" ON public.knowledge_items;
DROP POLICY IF EXISTS "Admins can delete knowledge items" ON public.knowledge_items;

CREATE POLICY "Admins can delete knowledge items"
  ON public.knowledge_items FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 8. PUBLIC.PROFILES (Anti-Privilege-Escalation su role, is_active, is_agent)
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (
    NEW.role IS DISTINCT FROM OLD.role
    OR NEW.is_active IS DISTINCT FROM OLD.is_active
    OR NEW.is_agent IS DISTINCT FROM OLD.is_agent
  ) THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Permesso negato: solo un amministratore può modificare role, is_active o is_agent';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

