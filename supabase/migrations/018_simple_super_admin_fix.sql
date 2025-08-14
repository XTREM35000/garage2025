-- Migration simplifiée pour corriger la table super_admins
-- Version minimale pour éviter les conflits

-- 1. Vérifier et corriger la structure de super_admins
DO $$
BEGIN
    -- Ajouter user_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'super_admins'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.super_admins ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        -- Mettre à jour les enregistrements existants
        UPDATE public.super_admins
        SET user_id = id
        WHERE user_id IS NULL AND id IS NOT NULL;

        ALTER TABLE public.super_admins ALTER COLUMN user_id SET NOT NULL;
    END IF;

    -- Ajouter les autres colonnes si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'email') THEN
        ALTER TABLE public.super_admins ADD COLUMN email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'nom') THEN
        ALTER TABLE public.super_admins ADD COLUMN nom TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'prenom') THEN
        ALTER TABLE public.super_admins ADD COLUMN prenom TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'phone') THEN
        ALTER TABLE public.super_admins ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'est_actif') THEN
        ALTER TABLE public.super_admins ADD COLUMN est_actif BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'created_at') THEN
        ALTER TABLE public.super_admins ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'updated_at') THEN
        ALTER TABLE public.super_admins ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Activer RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les anciennes politiques super_admins
DROP POLICY IF EXISTS "super_admins_initial_access" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_select_policy" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_insert_policy" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_update_policy" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_delete_policy" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_allow_initial_creation" ON public.super_admins;

-- 4. Créer les nouvelles politiques
CREATE POLICY "super_admins_allow_initial_creation" ON public.super_admins
    FOR INSERT WITH CHECK (true);

CREATE POLICY "super_admins_select_policy" ON public.super_admins
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.super_admins WHERE est_actif = true
        )
    );

CREATE POLICY "super_admins_update_policy" ON public.super_admins
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.super_admins WHERE est_actif = true
        )
    );

CREATE POLICY "super_admins_delete_policy" ON public.super_admins
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM public.super_admins WHERE est_actif = true
        )
    );

-- 5. Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.super_admins TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.super_admins TO authenticated;

-- 6. Trigger pour updated_at
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

-- 7. Fonction is_super_admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.super_admins
        WHERE super_admins.user_id = user_id AND est_actif = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Fonction create_super_admin
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

-- 9. Permissions sur les fonctions
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_super_admin(TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_super_admin(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- 10. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_super_admins_user_id ON public.super_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON public.super_admins(email);

-- 11. Commentaire
COMMENT ON TABLE public.super_admins IS 'Table des Super-Administrateurs de l''application';
