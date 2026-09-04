-- ==========================================================
-- Migrazione: Hardening RLS Modulo Marketing
-- ==========================================================

-- 1. Rimozione policy permissive preesistenti su marketing_campaigns
DROP POLICY IF EXISTS "Tutti possono visualizzare le campagne marketing" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Tutti possono inserire campagne marketing" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Tutti possono aggiornare campagne marketing" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Tutti possono eliminare campagne marketing" ON public.marketing_campaigns;

-- 2. Rimozione policy permissive preesistenti su marketing_posts
DROP POLICY IF EXISTS "Tutti possono visualizzare i post marketing" ON public.marketing_posts;
DROP POLICY IF EXISTS "Tutti possono inserire post marketing" ON public.marketing_posts;
DROP POLICY IF EXISTS "Tutti possono aggiornare post marketing" ON public.marketing_posts;
DROP POLICY IF EXISTS "Tutti possono eliminare post marketing" ON public.marketing_posts;

-- 3. Policy sicure per marketing_campaigns
-- Lettura: l'utente vede le proprie campagne (oppure campagne legacy senza owner)
CREATE POLICY "Utenti possono visualizzare le proprie campagne marketing"
    ON public.marketing_campaigns FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Inserimento: consentito solo per se stessi
CREATE POLICY "Utenti possono inserire le proprie campagne marketing"
    ON public.marketing_campaigns FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Aggiornamento: consentito solo sulle proprie campagne
CREATE POLICY "Utenti possono aggiornare le proprie campagne marketing"
    ON public.marketing_campaigns FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id);

-- Eliminazione: consentito solo sulle proprie campagne
CREATE POLICY "Utenti possono eliminare le proprie campagne marketing"
    ON public.marketing_campaigns FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- 4. Policy sicure per marketing_posts (legate alla ownership della campagna)
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
