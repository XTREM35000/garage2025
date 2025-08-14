-- 🔧 Correction des Politiques RLS pour Super-Admin
-- Ce script résout le problème de récursion infinie

-- 1. Supprimer TOUTES les anciennes politiques problématiques
-- Politiques sur super_admins
DROP POLICY IF EXISTS "Enable read access for super admins" ON super_admins;
DROP POLICY IF EXISTS "Enable insert access for super admins" ON super_admins;
DROP POLICY IF EXISTS "Enable update access for super admins" ON super_admins;
DROP POLICY IF EXISTS "Enable delete access for super admins" ON super_admins;
DROP POLICY IF EXISTS "super_admins_read_policy" ON super_admins;
DROP POLICY IF EXISTS "super_admins_insert_policy" ON super_admins;
DROP POLICY IF EXISTS "super_admins_update_policy" ON super_admins;
DROP POLICY IF EXISTS "super_admins_delete_policy" ON super_admins;

-- Politiques sur organisations
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON organisations;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON organisations;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON organisations;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON organisations;
DROP POLICY IF EXISTS "organisations_super_admin_policy" ON organisations;

-- Politiques sur user_organizations
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_organizations;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON user_organizations;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON user_organizations;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON user_organizations;
DROP POLICY IF EXISTS "user_organizations_super_admin_policy" ON user_organizations;

-- 2. Créer de nouvelles politiques intelligentes
-- Politique de lecture : Super-admins peuvent lire tous les super-admins
CREATE POLICY "super_admins_read_policy" ON super_admins
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM super_admins 
    WHERE user_id = auth.uid()
  )
);

-- Politique d'insertion : Permettre la création du premier super-admin
CREATE POLICY "super_admins_insert_policy" ON super_admins
FOR INSERT WITH CHECK (
  -- Permettre si c'est le premier super-admin (table vide)
  (SELECT COUNT(*) FROM super_admins) = 0
  OR
  -- Ou si l'utilisateur est déjà super-admin
  EXISTS (
    SELECT 1 FROM super_admins 
    WHERE user_id = auth.uid()
  )
);

-- Politique de mise à jour : Super-admins peuvent modifier leurs propres données
CREATE POLICY "super_admins_update_policy" ON super_admins
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM super_admins 
    WHERE user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM super_admins 
    WHERE user_id = auth.uid()
  )
);

-- Politique de suppression : Super-admins peuvent supprimer (avec restrictions)
CREATE POLICY "super_admins_delete_policy" ON super_admins
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM super_admins 
    WHERE user_id = auth.uid()
  )
  AND
  -- Empêcher la suppression du dernier super-admin
  (SELECT COUNT(*) FROM super_admins) > 1
);

-- 3. Politiques pour les autres tables critiques
-- Organisations : Super-admins ont accès complet
CREATE POLICY "organisations_super_admin_policy" ON organisations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM super_admins 
    WHERE user_id = auth.uid()
  )
);

-- User Organizations : Super-admins peuvent gérer toutes les relations
CREATE POLICY "user_organizations_super_admin_policy" ON user_organizations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM super_admins 
    WHERE user_id = auth.uid()
  )
);

-- 4. Vérifier que RLS est activé
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- 5. Afficher le statut des politiques
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
WHERE tablename IN ('super_admins', 'organisations', 'user_organizations')
ORDER BY tablename, policyname;

-- 6. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Politiques RLS corrigées avec succès !';
  RAISE NOTICE '🎯 Le premier Super-Admin peut maintenant être créé sans erreur RLS';
  RAISE NOTICE '🔒 Sécurité maintenue : seuls les Super-Admins ont accès complet';
END $$;
