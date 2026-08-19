-- ==============================================================================
-- SCHEMA INIZIALE PIATTAFORMA COLLABORATIVA (4 MEMBRI TEAM)
-- Corsi, Consulenze, Sviluppo Agenti AI (Idempotente / Eseguibile più volte)
-- ==============================================================================

-- Abilitazione estensioni richieste
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUM TYPES (con controllo IF NOT EXISTS)
-- ------------------------------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('dev', 'member', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_category') THEN
        CREATE TYPE project_category AS ENUM ('course', 'consulting', 'ai_agent', 'internal');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('active', 'paused', 'completed', 'archived');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_direction') THEN
        CREATE TYPE email_direction AS ENUM ('inbound', 'outbound');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_status') THEN
        CREATE TYPE email_status AS ENUM ('received', 'read', 'draft', 'sent', 'archived');
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. TABELLA PROFILES (Team Members)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'member',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. TABELLA PROJECTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
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

-- ------------------------------------------------------------------------------
-- 4. TABELLA TASKS (Kanban Board)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
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

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);

-- ------------------------------------------------------------------------------
-- 5. TABELLA MESSAGES (Chat Realtime di Team)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel TEXT NOT NULL DEFAULT 'generale',
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_messages_channel ON public.messages(channel, created_at DESC);

-- ------------------------------------------------------------------------------
-- 6. TABELLA EMAILS (Posta Condivisa)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emails (
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

CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON public.emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON public.emails(created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. TABELLA FILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_files_project_id ON public.files(project_id);

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

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_messages_updated_at ON public.messages;
CREATE TRIGGER set_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_emails_updated_at ON public.emails;
CREATE TRIGGER set_emails_updated_at BEFORE UPDATE ON public.emails FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-provisioning del profilo alla registrazione dell'utente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role public.user_role := 'member';
BEGIN
    BEGIN
        IF (NEW.raw_user_meta_data->>'role') IS NOT NULL AND (NEW.raw_user_meta_data->>'role') != '' THEN
            default_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        default_role := 'member';
    END;

    INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'User'), '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        default_role,
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
DROP POLICY IF EXISTS "Team members can view all profiles" ON public.profiles;
CREATE POLICY "Team members can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_team_member());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Policies per PROJECTS
DROP POLICY IF EXISTS "Team members full access to projects" ON public.projects;
CREATE POLICY "Team members full access to projects" ON public.projects FOR ALL TO authenticated USING (public.is_team_member()) WITH CHECK (public.is_team_member());

-- Policies per TASKS
DROP POLICY IF EXISTS "Team members full access to tasks" ON public.tasks;
CREATE POLICY "Team members full access to tasks" ON public.tasks FOR ALL TO authenticated USING (public.is_team_member()) WITH CHECK (public.is_team_member());

-- Policies per MESSAGES
DROP POLICY IF EXISTS "Team members can view messages" ON public.messages;
CREATE POLICY "Team members can view messages" ON public.messages FOR SELECT TO authenticated USING (public.is_team_member());

DROP POLICY IF EXISTS "Team members can insert messages" ON public.messages;
CREATE POLICY "Team members can insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (public.is_team_member() AND sender_id = auth.uid());

DROP POLICY IF EXISTS "Senders can update own messages" ON public.messages;
CREATE POLICY "Senders can update own messages" ON public.messages FOR UPDATE TO authenticated USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

-- Policies per EMAILS
DROP POLICY IF EXISTS "Team members full access to shared emails" ON public.emails;
CREATE POLICY "Team members full access to shared emails" ON public.emails FOR ALL TO authenticated USING (public.is_team_member()) WITH CHECK (public.is_team_member());

-- Policies per FILES
DROP POLICY IF EXISTS "Team members full access to files metadata" ON public.files;
CREATE POLICY "Team members full access to files metadata" ON public.files FOR ALL TO authenticated USING (public.is_team_member()) WITH CHECK (public.is_team_member());

-- ------------------------------------------------------------------------------
-- 10. REALTIME PUBLICATIONS
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'emails'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.emails;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- In caso di pubblicazione mancante
    NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 11. SUPABASE STORAGE BUCKET CONFIGURATION
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-files', 'team-files', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Team members can view storage files" ON storage.objects;
CREATE POLICY "Team members can view storage files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'team-files' AND public.is_team_member());

DROP POLICY IF EXISTS "Team members can upload storage files" ON storage.objects;
CREATE POLICY "Team members can upload storage files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'team-files' AND public.is_team_member());

DROP POLICY IF EXISTS "Team members can delete storage files" ON storage.objects;
CREATE POLICY "Team members can delete storage files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'team-files' AND public.is_team_member());
