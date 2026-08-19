-- ==============================================================================
-- SCHEMA INIZIALE PIATTAFORMA COLLABORATIVA (4 MEMBRI TEAM)
-- Corsi, Consulenze, Sviluppo Agenti AI
-- ==============================================================================

-- Abilitazione estensioni richieste
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUM TYPES
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('dev', 'member', 'admin');
CREATE TYPE project_category AS ENUM ('course', 'consulting', 'ai_agent', 'internal');
CREATE TYPE project_status AS ENUM ('active', 'paused', 'completed', 'archived');
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE email_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE email_status AS ENUM ('received', 'read', 'draft', 'sent', 'archived');

-- ------------------------------------------------------------------------------
-- 2. TABELLA PROFILES (Team Members)
-- ------------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'member',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.profiles IS 'Profili utente dei 4 membri autorizzati del team.';

-- ------------------------------------------------------------------------------
-- 3. TABELLA PROJECTS (Corsi, Consulenze, Agenti AI, Interni)
-- ------------------------------------------------------------------------------
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category project_category NOT NULL DEFAULT 'internal',
    status project_status NOT NULL DEFAULT 'active',
    client_name TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.projects IS 'Progetti suddivisi per Corsi, Consulenze e Agenti AI.';

-- ------------------------------------------------------------------------------
-- 4. TABELLA TASKS (Kanban Board)
-- ------------------------------------------------------------------------------
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    priority task_priority NOT NULL DEFAULT 'medium',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    position INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);

-- ------------------------------------------------------------------------------
-- 5. TABELLA MESSAGES (Chat Realtime di Team)
-- ------------------------------------------------------------------------------
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel TEXT NOT NULL DEFAULT 'generale',
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_messages_channel ON public.messages(channel, created_at DESC);

-- ------------------------------------------------------------------------------
-- 6. TABELLA EMAILS (Posta Condivisa - Resend Webhooks & Outbound)
-- ------------------------------------------------------------------------------
CREATE TABLE public.emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    direction email_direction NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT[] NOT NULL,
    cc_address TEXT[],
    bcc_address TEXT[],
    subject TEXT NOT NULL,
    body_html TEXT,
    body_text TEXT,
    status email_status NOT NULL DEFAULT 'received',
    thread_id TEXT,
    message_id TEXT UNIQUE,
    resend_id TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_emails_thread_id ON public.emails(thread_id);
CREATE INDEX idx_emails_created_at ON public.emails(created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. TABELLA FILES (Metadati storage per Supabase Storage)
-- ------------------------------------------------------------------------------
CREATE TABLE public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_files_project_id ON public.files(project_id);

-- ------------------------------------------------------------------------------
-- 8. TRIGGER FUNCTIONS (updated_at & Auth Sync)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_emails_updated_at BEFORE UPDATE ON public.emails FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-provisioning del profilo alla registrazione dell'utente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member'),
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) - Team-Only Access Control
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Helper function: verifica se l'utente corrente è un membro attivo del team
CREATE OR REPLACE FUNCTION public.is_team_member()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies per PROFILES
CREATE POLICY "Team members can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.is_team_member());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Policies per PROJECTS
CREATE POLICY "Team members full access to projects"
    ON public.projects FOR ALL
    TO authenticated
    USING (public.is_team_member())
    WITH CHECK (public.is_team_member());

-- Policies per TASKS
CREATE POLICY "Team members full access to tasks"
    ON public.tasks FOR ALL
    TO authenticated
    USING (public.is_team_member())
    WITH CHECK (public.is_team_member());

-- Policies per MESSAGES
CREATE POLICY "Team members can view messages"
    ON public.messages FOR SELECT
    TO authenticated
    USING (public.is_team_member());

CREATE POLICY "Team members can insert messages"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (public.is_team_member() AND sender_id = auth.uid());

CREATE POLICY "Senders can update own messages"
    ON public.messages FOR UPDATE
    TO authenticated
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Policies per EMAILS
CREATE POLICY "Team members full access to shared emails"
    ON public.emails FOR ALL
    TO authenticated
    USING (public.is_team_member())
    WITH CHECK (public.is_team_member());

-- Policies per FILES
CREATE POLICY "Team members full access to files metadata"
    ON public.files FOR ALL
    TO authenticated
    USING (public.is_team_member())
    WITH CHECK (public.is_team_member());

-- ------------------------------------------------------------------------------
-- 10. REALTIME PUBLICATIONS
-- ------------------------------------------------------------------------------
-- Abilita il realtime per le tabelle collaborative
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emails;

-- ------------------------------------------------------------------------------
-- 11. SUPABASE STORAGE BUCKET CONFIGURATION
-- ------------------------------------------------------------------------------
-- Inserimento bucket 'team-files' per i file condivisi
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-files', 'team-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Team members can view storage files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'team-files' AND public.is_team_member());

CREATE POLICY "Team members can upload storage files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'team-files' AND public.is_team_member());

CREATE POLICY "Team members can delete storage files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'team-files' AND public.is_team_member());
