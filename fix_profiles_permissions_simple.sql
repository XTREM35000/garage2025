-- Script SQL simplifié pour corriger les permissions de création de profils
-- Exécuter ce script dans votre base de données Supabase

-- 1. Créer la fonction pour créer des profils en contournant RLS
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

-- 2. Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_profile_bypass_rls(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_profile_bypass_rls(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- 3. Supprimer toutes les politiques existantes sur profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 4. Créer des politiques simples et permissives pour l'onboarding
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (true);

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (true);

-- 5. Supprimer toutes les politiques existantes sur super_admins
DROP POLICY IF EXISTS "super_admins_initial_setup" ON super_admins;
DROP POLICY IF EXISTS "super_admins_read_access" ON super_admins;
DROP POLICY IF EXISTS "super_admins_update_access" ON super_admins;

-- 6. Créer des politiques simples pour super_admins
CREATE POLICY "super_admins_insert_policy" ON super_admins
    FOR INSERT WITH CHECK (true);

CREATE POLICY "super_admins_select_policy" ON super_admins
    FOR SELECT USING (true);

CREATE POLICY "super_admins_update_policy" ON super_admins
    FOR UPDATE USING (true);

CREATE POLICY "super_admins_delete_policy" ON super_admins
    FOR DELETE USING (true);

-- 7. Supprimer toutes les politiques existantes sur onboarding_workflow_states
DROP POLICY IF EXISTS "Users can access workflow states during onboarding" ON onboarding_workflow_states;

-- 8. Créer une politique simple pour onboarding_workflow_states
CREATE POLICY "workflow_states_policy" ON onboarding_workflow_states
    FOR ALL USING (true);

-- 9. S'assurer que RLS est activé sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_workflow_states ENABLE ROW LEVEL SECURITY;

-- 10. Vérifier que la fonction a été créée
SELECT 
    'Fonction create_profile_bypass_rls créée avec succès!' as message,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_profile_bypass_rls';

-- 11. Vérifier les politiques créées
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'super_admins', 'onboarding_workflow_states')
ORDER BY tablename, policyname;
