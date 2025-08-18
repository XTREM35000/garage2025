-- =========================================
-- TABLE WORKFLOW_STATES - À EXÉCUTER MANUELLEMENT
-- =========================================

-- 1. Création de la table workflow_states
CREATE TABLE IF NOT EXISTS workflow_states (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index pour performance
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

-- 4. Politique RLS
ALTER TABLE workflow_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_owner_access" ON workflow_states;
CREATE POLICY "workflow_owner_access" ON workflow_states
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 5. Fonctions utilitaires
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

-- 6. Fonction de progression workflow
CREATE OR REPLACE FUNCTION advance_workflow(step TEXT)
RETURNS JSON AS $$
DECLARE
  current_completed TEXT[];
  new_completed TEXT[];
BEGIN
  -- Récupérer les étapes complétées actuelles
  SELECT completed_steps INTO current_completed
  FROM workflow_states 
  WHERE user_id = auth.uid();
  
  -- Ajouter la nouvelle étape si pas déjà présente
  IF step = ANY(COALESCE(current_completed, '{}')) THEN
    new_completed := current_completed;
  ELSE
    new_completed := COALESCE(current_completed, '{}') || ARRAY[step];
  END IF;
  
  -- Insérer ou mettre à jour
  INSERT INTO workflow_states (user_id, current_step, completed_steps)
  VALUES (auth.uid(), step, new_completed)
  ON CONFLICT (user_id) DO UPDATE
  SET current_step = EXCLUDED.current_step,
      completed_steps = new_completed,
      updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'current_step', step,
    'completed_steps', new_completed
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Fonction de diagnostic
CREATE OR REPLACE FUNCTION get_workflow_status()
RETURNS JSON AS $$
DECLARE
  workflow_data RECORD;
  super_admin_status BOOLEAN;
  profile_data RECORD;
  org_count INTEGER;
BEGIN
  -- Récupérer les données workflow
  SELECT * INTO workflow_data
  FROM workflow_states 
  WHERE user_id = auth.uid();
  
  -- Vérifier super admin
  SELECT is_super_admin() INTO super_admin_status;
  
  -- Récupérer profil
  SELECT role, phone_verified INTO profile_data
  FROM profiles 
  WHERE id = auth.uid();
  
  -- Compter les organisations
  SELECT COUNT(*) INTO org_count
  FROM user_organisations
  WHERE user_id = auth.uid();
  
  RETURN json_build_object(
    'workflow', COALESCE(row_to_json(workflow_data), '{}'),
    'is_super_admin', super_admin_status,
    'profile', COALESCE(row_to_json(profile_data), '{}'),
    'organization_count', org_count,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE workflow_states IS 'Table de gestion des états du workflow d''onboarding SaaS';
COMMENT ON FUNCTION advance_workflow(TEXT) IS 'Fonction de progression dans le workflow';
COMMENT ON FUNCTION get_workflow_status() IS 'Fonction de diagnostic du statut workflow';