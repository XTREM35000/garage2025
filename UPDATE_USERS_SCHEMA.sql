-- Mise à jour de la table users pour ajouter les colonnes manquantes
-- Exécuter dans SQL Editor de Supabase

-- 1. Ajout des colonnes manquantes
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS nom VARCHAR(255),
ADD COLUMN IF NOT EXISTS prenom VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS speciality VARCHAR(255),
ADD COLUMN IF NOT EXISTS hire_date DATE,
ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Mise à jour des contraintes et index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_organisation_id ON users(organisation_id);

-- 3. Mise à jour des données existantes (si nécessaire)
-- Copier les données depuis auth.users si elles existent
UPDATE users 
SET 
  email = auth.users.email,
  nom = auth.users.raw_user_meta_data->>'nom',
  prenom = auth.users.raw_user_meta_data->>'prenom',
  phone = auth.users.raw_user_meta_data->>'phone',
  role = COALESCE(auth.users.raw_user_meta_data->>'role', 'user'),
  avatar_url = auth.users.raw_user_meta_data->>'avatar_url'
FROM auth.users 
WHERE users.auth_user_id = auth.users.id 
AND users.email IS NULL;

-- 4. Vérification de la structure mise à jour
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM 
  information_schema.columns
WHERE 
  table_name = 'users'
  AND table_schema = 'public'
ORDER BY ordinal_position; 