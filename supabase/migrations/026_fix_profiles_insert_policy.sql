-- Migration pour corriger les politiques RLS de la table profiles
-- Ajout des politiques INSERT manquantes

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

-- 4. Vérifier que toutes les politiques sont en place
COMMENT ON TABLE profiles IS 'Table des profils utilisateurs avec RLS activé et politiques complètes';
