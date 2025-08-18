-- =====================================================
-- CORRECTION WORKFLOW SUPER ADMIN AVEC SPLASHSCREEN
-- =====================================================

-- 1. Vérification et création de la table super_admins si elle n'existe pas
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Correction de la fonction RPC create_super_admin
CREATE OR REPLACE FUNCTION create_super_admin(
  p_email text,
  p_password text,
  p_name text
) RETURNS uuid AS $$
DECLARE
  user_id uuid;
BEGIN
  -- D'abord créer l'utilisateur Auth
  user_id := auth.create_user(
    email => p_email,
    password => p_password
  )::uuid;

  -- Ensuite l'ajouter comme Super Admin
  INSERT INTO super_admins (id, email, name)
  VALUES (user_id, p_email, p_name);

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Politique RLS ajustée pour super_admins
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "super_admin_insert" ON super_admins;
DROP POLICY IF EXISTS "super_admin_select" ON super_admins;
DROP POLICY IF EXISTS "super_admin_update" ON super_admins;
DROP POLICY IF EXISTS "super_admin_delete" ON super_admins;

-- Nouvelle politique d'insertion - permet la création uniquement si aucun super admin n'existe
CREATE POLICY "super_admin_insert" ON super_admins
FOR INSERT WITH CHECK (
  NOT EXISTS (SELECT 1 FROM super_admins)
);

-- Politique de sélection - les super admins peuvent voir tous les super admins
CREATE POLICY "super_admin_select" ON super_admins
FOR SELECT USING (
  auth.uid() IN (SELECT id FROM super_admins)
);

-- Politique de mise à jour - les super admins peuvent modifier leur propre profil
CREATE POLICY "super_admin_update" ON super_admins
FOR UPDATE USING (
  auth.uid() = id
);

-- Politique de suppression - les super admins peuvent se supprimer eux-mêmes
CREATE POLICY "super_admin_delete" ON super_admins
FOR DELETE USING (
  auth.uid() = id
);

-- 4. Vérification des permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON super_admins TO authenticated;

-- 5. Test de la fonction (optionnel - à commenter en production)
-- SELECT create_super_admin('test@example.com', 'password123', 'Test User');

-- =====================================================
-- VÉRIFICATIONS POST-MIGRATION
-- =====================================================

-- Vérifier que la table existe
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'super_admins'
ORDER BY ordinal_position;

-- Vérifier que la fonction existe
SELECT 
  routine_name, 
  routine_type, 
  data_type
FROM information_schema.routines 
WHERE routine_name = 'create_super_admin';

-- Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'super_admins';

-- =====================================================
-- ROLLBACK EN CAS DE PROBLÈME
-- =====================================================
/*
-- Pour annuler les changements :
DROP FUNCTION IF EXISTS create_super_admin(text, text, text);
DROP TABLE IF EXISTS super_admins CASCADE;
*/
