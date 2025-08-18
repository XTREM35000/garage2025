-- Migration 020: Création de la table super_admins avec politique RLS
-- Date: 2025-01-17
-- Description: Table pour gérer les super administrateurs avec contrainte d'unicité

-- 1. Créer la table super_admins
CREATE TABLE IF NOT EXISTS public.super_admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT,
    phone TEXT,
    est_actif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Créer un index sur l'email pour les performances
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON public.super_admins(email);

-- 3. Créer un index sur est_actif pour les vérifications rapides
CREATE INDEX IF NOT EXISTS idx_super_admins_est_actif ON public.super_admins(est_actif);

-- 4. Créer un trigger pour updated_at
CREATE OR REPLACE FUNCTION update_super_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_super_admins_updated_at_trigger ON public.super_admins;
CREATE TRIGGER update_super_admins_updated_at_trigger
    BEFORE UPDATE ON public.super_admins
    FOR EACH ROW
    EXECUTE FUNCTION update_super_admins_updated_at();

-- 5. Activer RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- 6. Créer la politique pour permettre l'insertion initiale (un seul super-admin)
CREATE POLICY "single_super_admin" ON public.super_admins
    FOR INSERT WITH CHECK (
        NOT EXISTS (
            SELECT 1 FROM public.super_admins 
            WHERE est_actif = true
        )
    );

-- 7. Politique pour permettre la lecture
CREATE POLICY "super_admins_select" ON public.super_admins
    FOR SELECT USING (true);

-- 8. Politique pour permettre la mise à jour
CREATE POLICY "super_admins_update" ON public.super_admins
    FOR UPDATE USING (true);

-- 9. Politique pour permettre la suppression (seulement pour le super-admin lui-même)
CREATE POLICY "super_admins_delete" ON public.super_admins
    FOR DELETE USING (auth.uid() = id);

-- 10. Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.super_admins TO authenticated;
GRANT SELECT ON public.super_admins TO anon;

-- 11. Fonction pour vérifier si un utilisateur est super-admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.super_admins
        WHERE super_admins.id = user_id
        AND est_actif = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Fonction pour créer un super-admin (avec vérification d'unicité)
CREATE OR REPLACE FUNCTION create_super_admin(
    p_email TEXT,
    p_nom TEXT,
    p_prenom TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_super_admin_id UUID;
BEGIN
    -- Vérifier si l'utilisateur existe dans auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non trouvé dans auth.users';
    END IF;

    -- Vérifier si un Super-Admin existe déjà
    IF EXISTS (SELECT 1 FROM public.super_admins WHERE est_actif = true) THEN
        RAISE EXCEPTION 'Un Super-Admin existe déjà';
    END IF;

    -- Créer le Super-Admin
    INSERT INTO public.super_admins (id, email, nom, prenom, phone)
    VALUES (v_user_id, p_email, p_nom, p_prenom, p_phone)
    RETURNING id INTO v_super_admin_id;

    RETURN v_super_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Permissions sur les fonctions
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION create_super_admin(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- 14. Commentaire sur la table
COMMENT ON TABLE public.super_admins IS 'Table des Super-Administrateurs de l''application (un seul possible)';
COMMENT ON COLUMN public.super_admins.id IS 'Référence vers auth.users (clé primaire)';
COMMENT ON COLUMN public.super_admins.est_actif IS 'Indique si le super-admin est actif (toujours true pour l''instant)';

-- 15. Vérification de la contrainte d'unicité
-- Cette contrainte est gérée par la politique RLS "single_super_admin"
-- qui empêche l'insertion de plus d'un super-admin actif
