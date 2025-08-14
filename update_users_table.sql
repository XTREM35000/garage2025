-- Script pour ajouter les colonnes manquantes à la table users
-- À exécuter dans le SQL Editor de Supabase

-- 1. Ajouter la colonne full_name
ALTER TABLE users 
ADD COLUMN full_name TEXT;

-- 2. Ajouter la colonne role
ALTER TABLE users 
ADD COLUMN role TEXT DEFAULT 'user';

-- 3. Ajouter la colonne organisation_id
ALTER TABLE users 
ADD COLUMN organisation_id UUID REFERENCES organisations(id);

-- 4. Ajouter la colonne is_active
ALTER TABLE users 
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- 5. Vérifier la nouvelle structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
