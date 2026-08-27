-- ==========================================================
-- Migrazione: Modulo Marketing & Campagne di Pubblicazione
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    product_name TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    target_avatar TEXT,
    awareness_level TEXT DEFAULT 'Problem-Aware',
    core_desire TEXT,
    core_pain TEXT,
    big_idea TEXT,
    unique_mechanism TEXT,
    guarantee TEXT,
    budget_daily NUMERIC DEFAULT 20,
    platforms JSONB DEFAULT '["Meta Ads", "Instagram"]'::jsonb,
    kpi_cpa NUMERIC,
    kpi_roas NUMERIC DEFAULT 2.5,
    status TEXT DEFAULT 'draft', -- draft, active, scheduled, completed
    funnel_blueprint JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.marketing_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    post_type TEXT NOT NULL, -- carosello, reel, lead-magnet, mindset, statico
    title TEXT NOT NULL,
    summary TEXT,
    full_copy TEXT NOT NULL,
    tag TEXT,
    cta TEXT,
    platform TEXT DEFAULT 'Instagram',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft', -- draft, queued, published, failed
    n8n_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_campaign_id ON public.marketing_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_status ON public.marketing_posts(status);

-- Abilitazione RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_posts ENABLE ROW LEVEL SECURITY;

-- Policy per marketing_campaigns (Accessibile per utenti autenticati e anon se in locale/team hub)
CREATE POLICY "Tutti possono visualizzare le campagne marketing"
    ON public.marketing_campaigns FOR SELECT
    USING (true);

CREATE POLICY "Tutti possono inserire campagne marketing"
    ON public.marketing_campaigns FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Tutti possono aggiornare campagne marketing"
    ON public.marketing_campaigns FOR UPDATE
    USING (true);

CREATE POLICY "Tutti possono eliminare campagne marketing"
    ON public.marketing_campaigns FOR DELETE
    USING (true);

-- Policy per marketing_posts
CREATE POLICY "Tutti possono visualizzare i post marketing"
    ON public.marketing_posts FOR SELECT
    USING (true);

CREATE POLICY "Tutti possono inserire post marketing"
    ON public.marketing_posts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Tutti possono aggiornare post marketing"
    ON public.marketing_posts FOR UPDATE
    USING (true);

CREATE POLICY "Tutti possono eliminare post marketing"
    ON public.marketing_posts FOR DELETE
    USING (true);
