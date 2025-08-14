-- Migration pour l'architecture multi-instances
-- Tables: super_admins, access_logs, et politiques RLS

-- ========================================
-- TABLE: super_admins
-- ========================================
CREATE TABLE IF NOT EXISTS public.super_admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    phone TEXT,
    est_actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON public.super_admins(email);
CREATE INDEX IF NOT EXISTS idx_super_admins_est_actif ON public.super_admins(est_actif);

-- ========================================
-- TABLE: access_logs
-- ========================================
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    path TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL,
    success BOOLEAN NOT NULL,
    reason TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances et requêtes
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON public.access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_organisation_id ON public.access_logs(organisation_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_success ON public.access_logs(success);

-- ========================================
-- POLITIQUES RLS POUR super_admins
-- ========================================

-- Activer RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Politique: Seuls les super_admins peuvent voir tous les super_admins
CREATE POLICY "super_admins_select_policy" ON public.super_admins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.id = auth.uid()
        )
    );

-- Politique: Seuls les super_admins peuvent insérer
CREATE POLICY "super_admins_insert_policy" ON public.super_admins
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.id = auth.uid()
        ) OR
        -- Permettre la création du premier super_admin
        NOT EXISTS (SELECT 1 FROM public.super_admins)
    );

-- Politique: Seuls les super_admins peuvent modifier
CREATE POLICY "super_admins_update_policy" ON public.super_admins
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.id = auth.uid()
        )
    );

-- Politique: Seuls les super_admins peuvent supprimer
CREATE POLICY "super_admins_delete_policy" ON public.super_admins
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.id = auth.uid()
        )
    );

-- ========================================
-- POLITIQUES RLS POUR access_logs
-- ========================================

-- Activer RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Politique: Les super_admins peuvent voir tous les logs
CREATE POLICY "access_logs_super_admin_select" ON public.access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.id = auth.uid()
        )
    );

-- Politique: Les admins d'organisation peuvent voir les logs de leur organisation
CREATE POLICY "access_logs_admin_select" ON public.access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND u.organisation_id = access_logs.organisation_id
        )
    );

-- Politique: Les utilisateurs peuvent voir leurs propres logs
CREATE POLICY "access_logs_user_select" ON public.access_logs
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- Politique: Permettre l'insertion de logs (pour le système)
CREATE POLICY "access_logs_insert_policy" ON public.access_logs
    FOR INSERT WITH CHECK (true);

-- ========================================
-- MISE À JOUR DES POLITIQUES EXISTANTES
-- ========================================

-- Mettre à jour la politique des organisations pour inclure les super_admins
DROP POLICY IF EXISTS "organisations_select_policy" ON public.organisations;
CREATE POLICY "organisations_select_policy" ON public.organisations
    FOR SELECT USING (
        -- Super_admins peuvent voir toutes les organisations
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.id = auth.uid()
        ) OR
        -- Admins peuvent voir leur organisation
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND u.organisation_id = organisations.id
        ) OR
        -- Utilisateurs peuvent voir leur organisation
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.organisation_id = organisations.id
        )
    );

-- Mettre à jour la politique des utilisateurs
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT USING (
        -- Super_admins peuvent voir tous les utilisateurs
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.id = auth.uid()
        ) OR
        -- Admins peuvent voir les utilisateurs de leur organisation
        EXISTS (
            SELECT 1 FROM public.users admin
            WHERE admin.id = auth.uid()
            AND admin.role = 'admin'
            AND admin.organisation_id = users.organisation_id
        ) OR
        -- Utilisateurs peuvent voir leur propre profil
        users.id = auth.uid()
    );

-- ========================================
-- FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour vérifier si un utilisateur est super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.super_admins sa
        WHERE sa.id = user_id AND sa.est_actif = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir l'organisation de l'utilisateur
CREATE OR REPLACE FUNCTION public.get_user_organisation(user_id UUID DEFAULT auth.uid())
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT organisation_id FROM public.users u
        WHERE u.id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS POUR MAINTENANCE
-- ========================================

-- Trigger pour mettre à jour updated_at sur super_admins
CREATE OR REPLACE FUNCTION update_super_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_super_admins_updated_at
    BEFORE UPDATE ON public.super_admins
    FOR EACH ROW
    EXECUTE FUNCTION update_super_admins_updated_at();

-- ========================================
-- COMMENTAIRES
-- ========================================

COMMENT ON TABLE public.super_admins IS 'Table des administrateurs super avec accès global';
COMMENT ON TABLE public.access_logs IS 'Journal des tentatives d''accès pour audit et sécurité';
COMMENT ON FUNCTION public.is_super_admin(UUID) IS 'Vérifie si un utilisateur est super_admin';
COMMENT ON FUNCTION public.get_user_organisation(UUID) IS 'Récupère l''organisation d''un utilisateur';
