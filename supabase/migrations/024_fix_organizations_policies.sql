-- Correction des politiques RLS pour les organisations
-- Permettre à tous les utilisateurs authentifiés de voir les organisations en mode demo

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "organisations_select_policy" ON public.organisations;

-- Créer une nouvelle politique permissive pour le mode demo
CREATE POLICY "organisations_select_policy" ON public.organisations
    FOR SELECT USING (true);

-- Permettre aux utilisateurs authentifiés de voir toutes les organisations
CREATE POLICY "organisations_demo_select" ON public.organisations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre aux super admins de gérer les organisations
CREATE POLICY "organisations_super_admin_manage" ON public.organisations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.user_id = auth.uid()
            AND sa.est_actif = true
        )
    );
