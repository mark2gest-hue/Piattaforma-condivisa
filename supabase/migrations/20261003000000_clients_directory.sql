-- Migration: Create clients directory table (Rubrica & Anagrafica Clienti)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    company TEXT DEFAULT '',
    category TEXT NOT NULL DEFAULT 'academy' CHECK (category IN ('academy', 'business', 'partner', 'lead')),
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    province TEXT DEFAULT '',
    postal_code TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'prospect', 'inactive')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast search
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_company ON public.clients(company);
CREATE INDEX IF NOT EXISTS idx_clients_category ON public.clients(category);
CREATE INDEX IF NOT EXISTS idx_clients_city ON public.clients(city);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated team members can read/write clients
CREATE POLICY "Authenticated users full access to clients"
    ON public.clients
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION update_clients_updated_at();

-- Pre-populate with existing active students and leads if not already present
INSERT INTO public.clients (first_name, last_name, email, company, category, notes)
SELECT 
    COALESCE(split_part(student_name, ' ', 1), 'Studente') as first_name,
    COALESCE(substr(student_name, length(split_part(student_name, ' ', 1)) + 2), '') as last_name,
    student_email as email,
    'Corsista AI' as company,
    'academy' as category,
    'Importato automaticamente da codici studenti attivi' as notes
FROM public.student_codes
WHERE student_email IS NOT NULL AND is_active = true
ON CONFLICT DO NOTHING;
