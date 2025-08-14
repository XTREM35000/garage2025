-- Vérifier si la fonction existe
SELECT routine_name, routine_type, data_type 
FROM information_schema.routines 
WHERE routine_name = 'create_organisation_with_admin';

-- Vérifier la structure de la table users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Vérifier la structure de la table organisations
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'organisations' 
ORDER BY ordinal_position;

-- Vérifier la structure de la table user_organisations
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_organisations' 
ORDER BY ordinal_position;
