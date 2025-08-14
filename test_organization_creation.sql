-- Script de test pour la fonction create_organization_with_owner
-- À exécuter après avoir appliqué la migration 025

-- 1. Vérifier que la fonction existe
SELECT 
    routine_name,
    routine_type,
    data_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'create_organization_with_owner'
AND routine_schema = 'public';

-- 2. Vérifier la signature de la fonction
SELECT 
    p.parameter_name,
    p.data_type,
    p.parameter_default,
    p.ordinal_position
FROM information_schema.parameters p
JOIN information_schema.routines r ON p.specific_name = r.specific_name
WHERE r.routine_name = 'create_organization_with_owner'
AND r.routine_schema = 'public'
ORDER BY p.ordinal_position;

-- 3. Vérifier les permissions sur la fonction
SELECT 
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'create_organization_with_owner'
AND routine_schema = 'public';

-- 4. Vérifier la structure de la table user_organizations
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_organizations'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Vérifier les politiques RLS sur organisations
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
WHERE tablename = 'organisations'
AND schemaname = 'public';

-- 6. Vérifier les politiques RLS sur user_organizations
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
WHERE tablename = 'user_organizations'
AND schemaname = 'public';

-- 7. Test de la fonction (à exécuter avec un utilisateur authentifié)
-- Note: Cette partie doit être exécutée dans le contexte d'un utilisateur authentifié
/*
-- Simuler un appel à la fonction (remplacer par de vraies valeurs)
SELECT public.create_organization_with_owner(
    'Test Organization',
    'TEST001',
    'test-org',
    'test@example.com',
    'monthly',
    '00000000-0000-0000-0000-000000000000'::uuid
);
*/

-- 8. Vérifier les contraintes sur user_organizations
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'user_organizations'
AND tc.table_schema = 'public';

-- 9. Vérifier les index sur user_organizations
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'user_organizations'
AND schemaname = 'public';

-- 10. Résumé des vérifications
DO $$
DECLARE
    func_exists boolean;
    table_exists boolean;
    rls_enabled boolean;
    policies_count integer;
BEGIN
    -- Vérifier que la fonction existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'create_organization_with_owner'
        AND routine_schema = 'public'
    ) INTO func_exists;
    
    -- Vérifier que la table user_organizations existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_organizations'
        AND table_schema = 'public'
    ) INTO table_exists;
    
    -- Vérifier que RLS est activé sur organisations
    SELECT relrowsecurity 
    FROM pg_class 
    WHERE relname = 'organisations' 
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    INTO rls_enabled;
    
    -- Compter les politiques sur organisations
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE tablename = 'organisations' 
    AND schemaname = 'public'
    INTO policies_count;
    
    -- Afficher le résumé
    RAISE NOTICE '=== RÉSUMÉ DES VÉRIFICATIONS ===';
    RAISE NOTICE 'Fonction create_organization_with_owner: %', 
        CASE WHEN func_exists THEN '✅ EXISTE' ELSE '❌ MANQUANTE' END;
    RAISE NOTICE 'Table user_organizations: %', 
        CASE WHEN table_exists THEN '✅ EXISTE' ELSE '❌ MANQUANTE' END;
    RAISE NOTICE 'RLS activé sur organisations: %', 
        CASE WHEN rls_enabled THEN '✅ OUI' ELSE '❌ NON' END;
    RAISE NOTICE 'Nombre de politiques sur organisations: %', policies_count;
    
    IF func_exists AND table_exists AND rls_enabled AND policies_count > 0 THEN
        RAISE NOTICE '✅ Toutes les vérifications sont passées avec succès!';
    ELSE
        RAISE NOTICE '⚠️ Certaines vérifications ont échoué. Vérifiez les détails ci-dessus.';
    END IF;
END $$;
