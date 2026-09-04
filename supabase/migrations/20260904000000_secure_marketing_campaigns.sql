-- ==========================================================
-- Migrazione Completa: Modulo Marketing con RLS Hardening
-- ==========================================================

-- 1. Creazione Tabelle (se non esistono)
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
    status TEXT DEFAULT 'draft',
    funnel_blueprint JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.marketing_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    post_type TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    full_copy TEXT NOT NULL,
    tag TEXT,
    cta TEXT,
    platform TEXT DEFAULT 'Instagram',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft',
    n8n_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_user_id ON public.marketing_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_campaign_id ON public.marketing_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_status ON public.marketing_posts(status);

-- 2. Abilitazione RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_posts ENABLE ROW LEVEL SECURITY;

-- 3. Rimozione eventuali policy preesistenti
DROP POLICY IF EXISTS "Tutti possono visualizzare le campagne marketing" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Tutti possono inserire campagne marketing" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Tutti possono aggiornare campagne marketing" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Tutti possono eliminare campagne marketing" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Utenti possono visualizzare le proprie campagne marketing" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Utenti possono inserire le proprie campagne marketing" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Utenti possono aggiornare le proprie campagne marketing" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Utenti possono eliminare le proprie campagne marketing" ON public.marketing_campaigns;

DROP POLICY IF EXISTS "Tutti possono visualizzare i post marketing" ON public.marketing_posts;
DROP POLICY IF EXISTS "Tutti possono inserire post marketing" ON public.marketing_posts;
DROP POLICY IF EXISTS "Tutti possono aggiornare post marketing" ON public.marketing_posts;
DROP POLICY IF EXISTS "Tutti possono eliminare post marketing" ON public.marketing_posts;
DROP POLICY IF EXISTS "Utenti possono visualizzare i post delle proprie campagne" ON public.marketing_posts;
DROP POLICY IF EXISTS "Utenti possono inserire post nelle proprie campagne" ON public.marketing_posts;
DROP POLICY IF EXISTS "Utenti possono aggiornare post delle proprie campagne" ON public.marketing_posts;
DROP POLICY IF EXISTS "Utenti possono eliminare post delle proprie campagne" ON public.marketing_posts;

-- 4. Policy sicure per marketing_campaigns
CREATE POLICY "Utenti possono visualizzare le proprie campagne marketing"
    ON public.marketing_campaigns FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Utenti possono inserire le proprie campagne marketing"
    ON public.marketing_campaigns FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utenti possono aggiornare le proprie campagne marketing"
    ON public.marketing_campaigns FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utenti possono eliminare le proprie campagne marketing"
    ON public.marketing_campaigns FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- 5. Policy sicure per marketing_posts (vincolate alla campagna)
CREATE POLICY "Utenti possono visualizzare i post delle proprie campagne"
    ON public.marketing_posts FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.marketing_campaigns c
            WHERE c.id = campaign_id
              AND (c.user_id = auth.uid() OR c.user_id IS NULL)
        )
    );

CREATE POLICY "Utenti possono inserire post nelle proprie campagne"
    ON public.marketing_posts FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.marketing_campaigns c
            WHERE c.id = campaign_id
              AND (c.user_id = auth.uid() OR c.user_id IS NULL)
        )
    );

CREATE POLICY "Utenti possono aggiornare post delle proprie campagne"
    ON public.marketing_posts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.marketing_campaigns c
            WHERE c.id = campaign_id
              AND (c.user_id = auth.uid() OR c.user_id IS NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.marketing_campaigns c
            WHERE c.id = campaign_id
              AND (c.user_id = auth.uid() OR c.user_id IS NULL)
        )
    );

CREATE POLICY "Utenti possono eliminare post delle proprie campagne"
    ON public.marketing_posts FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.marketing_campaigns c
            WHERE c.id = campaign_id
              AND (c.user_id = auth.uid() OR c.user_id IS NULL)
        )
    );
