-- Script pour vérifier la structure de la table users
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier si la table users existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 2. Voir toutes les colonnes de la table users (FILTRÉ)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Voir la structure complète de la table users
\d users;

-- 4. Vérifier s'il y a une colonne pour l'ID utilisateur dans users
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND (column_name LIKE '%user%' OR column_name LIKE '%id%');

-- 5. Voir toutes les colonnes de users avec leurs types
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
