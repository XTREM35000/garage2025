-- Migration corrigée pour la table super_admins
-- Problème : La table existe déjà mais avec une structure différente

-- 1. Vérifier la structure actuelle de la table
DO $$
BEGIN
    -- Vérifier si la colonne user_id existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'super_admins'
        AND column_name = 'user_id'
    ) THEN
        -- Ajouter la colonne user_id si elle n'existe pas
        ALTER TABLE public.super_admins ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        -- Mettre à jour les enregistrements existants si nécessaire
        UPDATE public.super_admins
        SET user_id = id
        WHERE user_id IS NULL AND id IS NOT NULL;

        -- Rendre la colonne user_id NOT NULL après la mise à jour
        ALTER TABLE public.super_admins ALTER COLUMN user_id SET NOT NULL;
    END IF;

    -- Vérifier si la colonne email existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'super_admins'
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.super_admins ADD COLUMN email TEXT;
    END IF;

    -- Vérifier si la colonne nom existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'super_admins'
        AND column_name = 'nom'
    ) THEN
        ALTER TABLE public.super_admins ADD COLUMN nom TEXT;
    END IF;

    -- Vérifier si la colonne prenom existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'super_admins'
        AND column_name = 'prenom'
    ) THEN
        ALTER TABLE public.super_admins ADD COLUMN prenom TEXT;
    END IF;

    -- Vérifier si la colonne phone existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'super_admins'
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.super_admins ADD COLUMN phone TEXT;
    END IF;

    -- Vérifier si la colonne est_actif existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'super_admins'
        AND column_name = 'est_actif'
    ) THEN
        ALTER TABLE public.super_admins ADD COLUMN est_actif BOOLEAN DEFAULT true;
    END IF;

    -- Vérifier si la colonne created_at existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'super_admins'
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.super_admins ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Vérifier si la colonne updated_at existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'super_admins'
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.super_admins ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Activer RLS sur la table
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les anciennes politiques qui pourraient causer des conflits
DROP POLICY IF EXISTS "super_admins_initial_access" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_select_policy" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_insert_policy" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_update_policy" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_delete_policy" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_allow_initial_creation" ON public.super_admins;

-- 4. Créer des politiques RLS plus permissives pour l'initialisation
-- Politique pour permettre la création du premier Super-Admin
CREATE POLICY "super_admins_allow_initial_creation" ON public.super_admins
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture par les Super-Admins
CREATE POLICY "super_admins_select_policy" ON public.super_admins
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.super_admins WHERE est_actif = true
        )
    );

-- Politique pour permettre la mise à jour par les Super-Admins
CREATE POLICY "super_admins_update_policy" ON public.super_admins
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.super_admins WHERE est_actif = true
        )
    );

-- Politique pour permettre la suppression par les Super-Admins
CREATE POLICY "super_admins_delete_policy" ON public.super_admins
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM public.super_admins WHERE est_actif = true
        )
    );

-- 5. Accorder les permissions nécessaires
GRANT SELECT, INSERT, UPDATE, DELETE ON public.super_admins TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.super_admins TO authenticated;

-- 6. Créer un trigger pour updated_at
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

-- 7. Créer une fonction pour vérifier si un utilisateur est Super-Admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.super_admins
        WHERE super_admins.user_id = user_id AND est_actif = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Créer une fonction pour créer un Super-Admin de manière sécurisée
CREATE OR REPLACE FUNCTION create_super_admin(
    p_email TEXT,
    p_nom TEXT,
    p_prenom TEXT,
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
    INSERT INTO public.super_admins (user_id, email, nom, prenom, phone)
    VALUES (v_user_id, p_email, p_nom, p_prenom, p_phone)
    RETURNING id INTO v_super_admin_id;

    RETURN v_super_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Accorder les permissions sur les fonctions
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_super_admin(TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_super_admin(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- 10. Vérifier que la table access_logs existe
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    path TEXT,
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    organisation_id UUID REFERENCES public.organisations(id),
    success BOOLEAN,
    reason TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Activer RLS sur access_logs
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- 12. Politiques pour access_logs
DROP POLICY IF EXISTS "access_logs_insert_policy" ON public.access_logs;
DROP POLICY IF EXISTS "access_logs_select_policy" ON public.access_logs;

CREATE POLICY "access_logs_insert_policy" ON public.access_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "access_logs_select_policy" ON public.access_logs
    FOR SELECT USING (
        is_super_admin() OR
        auth.uid() = user_id OR
        (organisation_id IS NOT NULL AND organisation_id IN (
            SELECT organisation_id FROM public.users WHERE user_id = auth.uid()
        ))
    );

-- 13. Permissions pour access_logs
GRANT SELECT, INSERT ON public.access_logs TO anon;
GRANT SELECT, INSERT ON public.access_logs TO authenticated;

-- 14. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_super_admins_user_id ON public.super_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON public.super_admins(email);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON public.access_logs(timestamp);

-- 15. Commentaire pour documenter
COMMENT ON TABLE public.super_admins IS 'Table des Super-Administrateurs de l''application';
COMMENT ON TABLE public.access_logs IS 'Table des logs d''accès pour audit et sécurité';
