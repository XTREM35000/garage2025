-- Migration de correction pour la table super_admins
-- Vérification et création si nécessaire

-- ========================================
-- VÉRIFICATION ET CRÉATION DE LA TABLE super_admins
-- ========================================

-- Supprimer la table si elle existe (pour éviter les conflits)
DROP TABLE IF EXISTS public.super_admins CASCADE;

-- Recréer la table super_admins
CREATE TABLE public.super_admins (
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
-- VÉRIFICATION ET CRÉATION DE LA TABLE access_logs
-- ========================================

-- Supprimer la table si elle existe
DROP TABLE IF EXISTS public.access_logs CASCADE;

-- Recréer la table access_logs
CREATE TABLE public.access_logs (
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

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON public.access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_organisation_id ON public.access_logs(organisation_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_success ON public.access_logs(success);

-- ========================================
-- POLITIQUES RLS SIMPLIFIÉES POUR super_admins
-- ========================================

-- Activer RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Politique temporaire pour permettre l'accès initial
-- À SUPPRIMER APRÈS LA CRÉATION DU PREMIER SUPER_ADMIN
CREATE POLICY "super_admins_initial_access" ON public.super_admins
    FOR ALL USING (true);

-- ========================================
-- POLITIQUES RLS POUR access_logs
-- ========================================

-- Activer RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion de logs
CREATE POLICY "access_logs_insert_policy" ON public.access_logs
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture des logs (temporaire)
CREATE POLICY "access_logs_select_policy" ON public.access_logs
    FOR SELECT USING (true);

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
-- TRIGGERS
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

-- ========================================
-- VÉRIFICATION FINALE
-- ========================================

-- Vérifier que les tables existent
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'super_admins') THEN
        RAISE EXCEPTION 'Table super_admins non créée';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'access_logs') THEN
        RAISE EXCEPTION 'Table access_logs non créée';
    END IF;

    RAISE NOTICE 'Migration 015 terminée avec succès';
END $$;
