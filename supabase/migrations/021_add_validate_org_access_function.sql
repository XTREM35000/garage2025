-- Fonction RPC pour valider l'accès aux organisations
CREATE OR REPLACE FUNCTION public.validate_org_access(
  org_id uuid,
  user_id uuid,
  org_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_valid boolean;
BEGIN
  -- Vérifier que les paramètres ne sont pas null
  IF org_id IS NULL OR user_id IS NULL OR org_code IS NULL THEN
    RETURN false;
  END IF;

  -- Mode demo : vérifier d'abord si le code correspond à l'organisation
  SELECT EXISTS (
    SELECT 1 FROM organisations o
    WHERE o.id = validate_org_access.org_id
      AND o.code = validate_org_access.org_code
  ) INTO is_valid;

  -- Si le code correspond, permettre l'accès (mode demo)
  IF is_valid THEN
    RETURN true;
  END IF;

  -- Sinon, vérifier les permissions via user_organizations
  SELECT EXISTS (
    SELECT 1 FROM user_organizations uo
    JOIN organisations o ON uo.organization_id = o.id
    WHERE uo.user_id = validate_org_access.user_id
      AND o.id = validate_org_access.org_id
      AND o.code = validate_org_access.org_code
  ) INTO is_valid;

  RETURN is_valid;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, retourner false
    RETURN false;
END;
$$;

-- Politique pour la table user_organizations
CREATE POLICY "Enable read access for user's orgs"
ON user_organizations
FOR SELECT
USING (user_id = auth.uid());

-- Politique pour les organisations
CREATE POLICY "Enable read access for org members"
ON organisations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid()
    AND organization_id = organisations.id
  )
);

-- Ajouter la colonne access_code à la table organisations si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organisations'
    AND column_name = 'access_code'
  ) THEN
    ALTER TABLE organisations ADD COLUMN access_code text;
  END IF;
END $$;

-- Mettre à jour les organisations existantes avec un code d'accès par défaut
UPDATE organisations
SET access_code = 'ORG' || substr(id::text, 1, 8)
WHERE access_code IS NULL;
