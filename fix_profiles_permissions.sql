-- Script SQL pour corriger les permissions de création de profils
-- Exécuter ce script dans votre base de données Supabase

-- 1. Ajouter la politique INSERT pour permettre aux utilisateurs de créer leur propre profil
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Ajouter la politique INSERT pour permettre aux admins de créer des profils
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
CREATE POLICY "Admins can insert profiles" ON profiles
    FOR INSERT WITH CHECK (
        get_user_role() IN ('proprietaire', 'chef-garagiste', 'superadmin')
    );

-- 3. Ajouter la politique DELETE pour permettre aux admins de supprimer des profils
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles" ON profiles
    FOR DELETE USING (
        get_user_role() IN ('proprietaire', 'chef-garagiste', 'superadmin')
    );

-- 4. Créer la fonction pour créer des profils en contournant RLS
CREATE OR REPLACE FUNCTION public.create_profile_bypass_rls(
    p_user_id UUID,
    p_email TEXT,
    p_name TEXT,
    p_role TEXT DEFAULT 'user'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Vérifier si le profil existe déjà
    IF EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
        RAISE NOTICE 'Profil déjà existant pour l''utilisateur %', p_user_id;
        RETURN true;
    END IF;

    -- Créer le profil en contournant RLS
    INSERT INTO profiles (
        id,
        email,
        nom,
        prenom,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_email,
        p_name,
        '', -- prenom vide par défaut
        p_role,
        true,
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Profil créé avec succès pour l''utilisateur %', p_user_id;
    RETURN true;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la création du profil: %', SQLERRM;
        RETURN false;
END;
$$;

-- 5. Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_profile_bypass_rls(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_profile_bypass_rls(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- 6. Vérifier que toutes les politiques sont en place
COMMENT ON TABLE profiles IS 'Table des profils utilisateurs avec RLS activé et politiques complètes';
COMMENT ON FUNCTION public.create_profile_bypass_rls(UUID, TEXT, TEXT, TEXT) IS 
'Fonction pour créer des profils en contournant RLS lors de l''onboarding initial';

-- 7. Corriger les politiques RLS pour onboarding_workflow_states
-- Permettre l'accès aux utilisateurs authentifiés pendant l'onboarding
DROP POLICY IF EXISTS "Users can access workflow states during onboarding" ON onboarding_workflow_states;
CREATE POLICY "Users can access workflow states during onboarding"
    ON onboarding_workflow_states
    FOR ALL
    USING (
        -- Permettre l'accès si l'utilisateur est authentifié
        auth.role() = 'authenticated'
        OR
        -- Ou si c'est un super admin
        EXISTS (
            SELECT 1 FROM public.super_admins 
            WHERE user_id = auth.uid() AND est_actif = true
        )
    );

-- 8. Corriger les politiques RLS pour super_admins
-- Permettre la création du premier super-admin sans restrictions
DROP POLICY IF EXISTS "super_admins_initial_setup" ON super_admins;
CREATE POLICY "super_admins_initial_setup"
    ON super_admins
    FOR INSERT
    WITH CHECK (
        -- Permettre si c'est le premier super-admin (table vide)
        (SELECT COUNT(*) FROM super_admins) = 0
        OR
        -- Ou si l'utilisateur est déjà super-admin
        EXISTS (
            SELECT 1 FROM super_admins 
            WHERE user_id = auth.uid()
        )
        OR
        -- Ou si l'utilisateur est authentifié et qu'il n'y a pas encore de super-admin
        (auth.role() = 'authenticated' AND (SELECT COUNT(*) FROM super_admins) = 0)
    );

-- 9. Afficher un message de confirmation
SELECT 'Permissions de création de profils, workflow et super-admin corrigées avec succès!' as message;
