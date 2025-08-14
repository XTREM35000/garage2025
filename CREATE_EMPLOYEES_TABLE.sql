-- Création de la table employees pour une gestion professionnelle du personnel
-- Exécuter dans SQL Editor de Supabase

-- 1. Création de la table employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  
  -- Informations personnelles
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  
  -- Informations professionnelles
  employee_id VARCHAR(50) UNIQUE, -- Numéro d'employé unique
  position VARCHAR(100) NOT NULL, -- Poste/emploi
  department VARCHAR(100), -- Département
  speciality VARCHAR(255), -- Spécialité technique
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  contract_type VARCHAR(50) DEFAULT 'CDI', -- CDI, CDD, Stage, etc.
  salary_grade VARCHAR(20), -- Grade salarial
  
  -- Statut et permissions
  is_active BOOLEAN DEFAULT true,
  can_access_system BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}',
  
  -- Informations supplémentaires
  emergency_contact JSONB, -- Contact d'urgence
  address TEXT,
  birth_date DATE,
  national_id VARCHAR(50),
  
  -- Métadonnées
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone ~* '^\+?[0-9\s\-\(\)]+$')
);

-- 2. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_employees_organisation_id ON employees(organisation_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date);

-- 3. Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_employees_updated_at();

-- 4. RLS (Row Level Security) pour la sécurité
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs de la même organisation
CREATE POLICY "Users can view employees in their organization" ON employees
  FOR SELECT USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Politique pour les admins de l'organisation
CREATE POLICY "Admins can manage employees in their organization" ON employees
  FOR ALL USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'proprietaire')
    )
  );

-- 5. Fonction pour créer un employé avec utilisateur
CREATE OR REPLACE FUNCTION create_employee_with_user(
  p_first_name VARCHAR(100),
  p_last_name VARCHAR(100),
  p_email VARCHAR(255),
  p_phone VARCHAR(50),
  p_position VARCHAR(100),
  p_organisation_id UUID,
  p_password VARCHAR(255) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_employee_id UUID;
BEGIN
  -- Créer l'utilisateur si nécessaire
  IF p_password IS NOT NULL THEN
    -- Créer un compte auth (cette partie nécessiterait une fonction edge)
    -- Pour l'instant, on suppose que l'utilisateur existe déjà
    SELECT id INTO v_user_id FROM users WHERE email = p_email;
  ELSE
    SELECT id INTO v_user_id FROM users WHERE email = p_email;
  END IF;
  
  -- Créer l'employé
  INSERT INTO employees (
    user_id,
    organisation_id,
    first_name,
    last_name,
    email,
    phone,
    position,
    hire_date
  ) VALUES (
    v_user_id,
    p_organisation_id,
    p_first_name,
    p_last_name,
    p_email,
    p_phone,
    p_position,
    CURRENT_DATE
  ) RETURNING id INTO v_employee_id;
  
  RETURN v_employee_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Vérification de la structure
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM 
  information_schema.columns
WHERE 
  table_name = 'employees'
  AND table_schema = 'public'
ORDER BY ordinal_position; 