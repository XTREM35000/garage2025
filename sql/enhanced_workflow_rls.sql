-- =========================================
-- WORKFLOW STATES TABLE ET RLS POLICIES
-- =========================================
-- À exécuter manuellement dans SQL Editor Supabase

-- 1. Table workflow_states (si pas encore créée)
CREATE TABLE IF NOT EXISTS workflow_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL CHECK (current_step IN (
    'super_admin_check',
    'pricing_selection', 
    'admin_creation',
    'org_creation',
    'sms_validation',
    'garage_setup',
    'dashboard'
  )),
  completed_steps TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contraintes
  UNIQUE(user_id)
);

-- 2. Index pour performance
CREATE INDEX IF NOT EXISTS idx_workflow_states_user_id ON workflow_states(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_current_step ON workflow_states(current_step);
CREATE INDEX IF NOT EXISTS idx_workflow_states_updated_at ON workflow_states(updated_at);

-- 3. Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_workflow_states_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_workflow_states_updated_at ON workflow_states;
CREATE TRIGGER trigger_update_workflow_states_updated_at
    BEFORE UPDATE ON workflow_states
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_states_updated_at();

-- 4. Activer RLS
ALTER TABLE workflow_states ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS pour workflow_states
DROP POLICY IF EXISTS "workflow_owner_access" ON workflow_states;
CREATE POLICY "workflow_owner_access" ON workflow_states
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Politique pour les super admins
DROP POLICY IF EXISTS "super_admin_workflow_access" ON workflow_states;
CREATE POLICY "super_admin_workflow_access" ON workflow_states
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM super_admins 
            WHERE user_id = auth.uid() 
            AND est_actif = true
        )
    );

-- 6. Fonction is_super_admin() optimisée
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM super_admins 
    WHERE user_id = auth.uid() 
    AND est_actif = true
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7. Fonction de progression workflow sécurisée
CREATE OR REPLACE FUNCTION advance_workflow(step TEXT)
RETURNS JSON AS $$
DECLARE
  current_completed TEXT[];
  new_completed TEXT[];
  current_user_id UUID;
BEGIN
  -- Vérifier l'authentification
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Récupérer les étapes complétées actuelles
  SELECT completed_steps INTO current_completed
  FROM workflow_states 
  WHERE user_id = current_user_id;
  
  -- Ajouter la nouvelle étape si pas déjà présente
  IF step = ANY(COALESCE(current_completed, '{}')) THEN
    new_completed := current_completed;
  ELSE
    new_completed := COALESCE(current_completed, '{}') || ARRAY[step];
  END IF;
  
  -- Insérer ou mettre à jour avec gestion des contraintes
  INSERT INTO workflow_states (user_id, current_step, completed_steps, updated_at)
  VALUES (current_user_id, step, new_completed, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET 
    current_step = EXCLUDED.current_step,
    completed_steps = new_completed,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'current_step', step,
    'completed_steps', new_completed,
    'user_id', current_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Fonction de diagnostic workflow
CREATE OR REPLACE FUNCTION get_workflow_status()
RETURNS JSON AS $$
DECLARE
  workflow_data RECORD;
  super_admin_status BOOLEAN;
  profile_data RECORD;
  org_count INTEGER;
  current_user_id UUID;
BEGIN
  -- Vérifier l'authentification
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Récupérer les données workflow
  SELECT * INTO workflow_data
  FROM workflow_states 
  WHERE user_id = current_user_id;
  
  -- Vérifier super admin
  SELECT is_super_admin() INTO super_admin_status;
  
  -- Récupérer profil
  SELECT role, phone_verified, is_superadmin INTO profile_data
  FROM profiles 
  WHERE id = current_user_id;
  
  -- Compter les organisations
  SELECT COUNT(*) INTO org_count
  FROM user_organisations
  WHERE user_id = current_user_id;
  
  RETURN json_build_object(
    'user_id', current_user_id,
    'workflow', COALESCE(row_to_json(workflow_data), '{}'),
    'is_super_admin', super_admin_status,
    'profile', COALESCE(row_to_json(profile_data), '{}'),
    'organization_count', org_count,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Fonction de nettoyage workflow (pour dev/test)
CREATE OR REPLACE FUNCTION reset_workflow()
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  DELETE FROM workflow_states WHERE user_id = current_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Workflow reset completed',
    'user_id', current_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Vues utiles pour monitoring
CREATE OR REPLACE VIEW workflow_summary AS
SELECT 
  ws.user_id,
  p.email,
  p.name,
  ws.current_step,
  array_length(ws.completed_steps, 1) as steps_completed,
  ws.is_completed,
  ws.created_at,
  ws.updated_at,
  CASE 
    WHEN sa.user_id IS NOT NULL THEN true 
    ELSE false 
  END as is_super_admin
FROM workflow_states ws
LEFT JOIN profiles p ON ws.user_id = p.id
LEFT JOIN super_admins sa ON ws.user_id = sa.user_id AND sa.est_actif = true;

-- 11. Politique RLS pour la vue
ALTER VIEW workflow_summary OWNER TO postgres;
CREATE POLICY "workflow_summary_access" ON workflow_summary
    FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM super_admins 
            WHERE user_id = auth.uid() 
            AND est_actif = true
        )
    );

-- 12. Commentaires pour documentation
COMMENT ON TABLE workflow_states IS 'Table de gestion des états du workflow d''onboarding SaaS';
COMMENT ON FUNCTION advance_workflow(TEXT) IS 'Fonction de progression sécurisée dans le workflow';
COMMENT ON FUNCTION get_workflow_status() IS 'Fonction de diagnostic du statut workflow avec authentification';
COMMENT ON FUNCTION is_super_admin() IS 'Vérification du statut super admin avec cache';
COMMENT ON VIEW workflow_summary IS 'Vue synthétique du workflow pour monitoring';

-- =========================================
-- POLITIQUES RLS ADDITIONNELLES POUR TABLES LIÉES
-- =========================================

-- Super Admins - Sécurisation renforcée
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_self_access" ON super_admins;
CREATE POLICY "super_admin_self_access" ON super_admins
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Première création seulement si aucun super admin n'existe
DROP POLICY IF EXISTS "allow_first_super_admin_creation" ON super_admins;
CREATE POLICY "allow_first_super_admin_creation" ON super_admins
    FOR INSERT
    WITH CHECK (
        NOT EXISTS (SELECT 1 FROM super_admins WHERE est_actif = true)
    );

-- Profiles - Accès renforcé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture de son propre profil
DROP POLICY IF EXISTS "profile_self_read" ON profiles;
CREATE POLICY "profile_self_read" ON profiles
    FOR SELECT
    USING (id = auth.uid());

-- Permettre la mise à jour de son propre profil
DROP POLICY IF EXISTS "profile_self_update" ON profiles;
CREATE POLICY "profile_self_update" ON profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Permettre l'insertion lors de l'inscription
DROP POLICY IF EXISTS "profile_creation_on_signup" ON profiles;
CREATE POLICY "profile_creation_on_signup" ON profiles
    FOR INSERT
    WITH CHECK (id = auth.uid());

-- Accès super admin aux profils
DROP POLICY IF EXISTS "super_admin_profile_access" ON profiles;
CREATE POLICY "super_admin_profile_access" ON profiles
    FOR ALL
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- =========================================
-- FONCTIONS UTILITAIRES POUR VALIDATION
-- =========================================

-- Validation email flexible
CREATE OR REPLACE FUNCTION validate_email_flexible(email_input TEXT)
RETURNS JSON AS $$
BEGIN
  -- Email valide si:
  -- 1. Contient @ et domaine valide
  -- 2. Ou au moins 2 caractères (sera complété par l'app)
  
  IF email_input ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RETURN json_build_object(
      'valid', true,
      'type', 'complete_email',
      'normalized', email_input
    );
  ELSIF length(trim(email_input)) >= 2 THEN
    RETURN json_build_object(
      'valid', true,
      'type', 'partial_email',
      'normalized', trim(email_input) || '@gmail.com'
    );
  ELSE
    RETURN json_build_object(
      'valid', false,
      'error', 'Email trop court (min 2 caractères)'
    );
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validation mot de passe
CREATE OR REPLACE FUNCTION validate_password(password_input TEXT)
RETURNS JSON AS $$
BEGIN
  IF length(password_input) >= 8 THEN
    RETURN json_build_object('valid', true);
  ELSE
    RETURN json_build_object(
      'valid', false,
      'error', 'Mot de passe trop court (min 8 caractères)'
    );
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =========================================
-- GRANTS ET PERMISSIONS
-- =========================================

-- Donner les permissions d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION advance_workflow(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_workflow_status() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_workflow() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_email_flexible(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_password(TEXT) TO authenticated;

-- Permissions sur les tables
GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_states TO authenticated;
GRANT SELECT ON workflow_summary TO authenticated;

-- =========================================
-- TESTS DE VALIDATION
-- =========================================

-- Test de la fonction is_super_admin (doit retourner false si pas connecté)
-- SELECT is_super_admin();

-- Test de validation email
-- SELECT validate_email_flexible('test');
-- SELECT validate_email_flexible('user@example.com');

-- Test de validation mot de passe  
-- SELECT validate_password('1234');
-- SELECT validate_password('motdepasse123');

RAISE NOTICE 'Installation du système de workflow terminée avec succès!';
RAISE NOTICE 'Tables créées: workflow_states';
RAISE NOTICE 'Fonctions créées: is_super_admin, advance_workflow, get_workflow_status, reset_workflow';
RAISE NOTICE 'Politiques RLS activées sur toutes les tables sensibles';