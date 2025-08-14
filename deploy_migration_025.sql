-- Script de déploiement rapide pour la migration 025
-- Correction de la création d'organisations
-- Date: 2025-01-27

-- Afficher le statut avant la migration
DO $$
BEGIN
    RAISE NOTICE '🚀 DÉBUT DE LA MIGRATION 025';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Vérification de l''état actuel...';
END $$;

-- 1. Vérifier l'état actuel
DO $$
DECLARE
    func_exists boolean;
    table_exists boolean;
    rls_enabled boolean;
BEGIN
    -- Vérifier si la fonction existe déjà
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'create_organization_with_owner'
        AND routine_schema = 'public'
    ) INTO func_exists;
    
    -- Vérifier si la table user_organizations existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_organizations'
        AND table_schema = 'public'
    ) INTO table_exists;
    
    -- Vérifier si RLS est activé sur organisations
    SELECT relrowsecurity 
    FROM pg_class 
    WHERE relname = 'organisations' 
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    INTO rls_enabled;
    
    RAISE NOTICE 'État actuel:';
    RAISE NOTICE '  - Fonction create_organization_with_owner: %', 
        CASE WHEN func_exists THEN 'EXISTE' ELSE 'MANQUANTE' END;
    RAISE NOTICE '  - Table user_organizations: %', 
        CASE WHEN table_exists THEN 'EXISTE' ELSE 'MANQUANTE' END;
    RAISE NOTICE '  - RLS sur organisations: %', 
        CASE WHEN rls_enabled THEN 'ACTIVÉ' ELSE 'DÉSACTIVÉ' END;
END $$;

-- 2. Appliquer la migration
\i supabase/migrations/025_fix_organization_creation.sql

-- 3. Vérifier le succès de la migration
DO $$
DECLARE
    func_exists boolean;
    table_exists boolean;
    rls_enabled boolean;
    policies_count integer;
    success boolean := true;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VÉRIFICATION POST-MIGRATION';
    RAISE NOTICE '=====================================';
    
    -- Vérifier que la fonction a été créée
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'create_organization_with_owner'
        AND routine_schema = 'public'
    ) INTO func_exists;
    
    IF NOT func_exists THEN
        RAISE NOTICE '❌ La fonction create_organization_with_owner n''a pas été créée';
        success := false;
    ELSE
        RAISE NOTICE '✅ Fonction create_organization_with_owner créée avec succès';
    END IF;
    
    -- Vérifier que la table user_organizations existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_organizations'
        AND table_schema = 'public'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE '❌ La table user_organizations n''existe pas';
        success := false;
    ELSE
        RAISE NOTICE '✅ Table user_organizations existe';
    END IF;
    
    -- Vérifier que RLS est activé sur organisations
    SELECT relrowsecurity 
    FROM pg_class 
    WHERE relname = 'organisations' 
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    INTO rls_enabled;
    
    IF NOT rls_enabled THEN
        RAISE NOTICE '❌ RLS n''est pas activé sur organisations';
        success := false;
    ELSE
        RAISE NOTICE '✅ RLS activé sur organisations';
    END IF;
    
    -- Compter les politiques sur organisations
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE tablename = 'organisations' 
    AND schemaname = 'public'
    INTO policies_count;
    
    IF policies_count = 0 THEN
        RAISE NOTICE '❌ Aucune politique RLS sur organisations';
        success := false;
    ELSE
        RAISE NOTICE '✅ % politiques RLS créées sur organisations', policies_count;
    END IF;
    
    -- Vérifier la structure de user_organizations
    IF table_exists THEN
        -- Vérifier la colonne organization_id
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_organizations' 
            AND column_name = 'organization_id' 
            AND table_schema = 'public'
        ) THEN
            RAISE NOTICE '❌ Colonne organization_id manquante dans user_organizations';
            success := false;
        ELSE
            RAISE NOTICE '✅ Colonne organization_id présente dans user_organizations';
        END IF;
        
        -- Vérifier la colonne role
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_organizations' 
            AND column_name = 'role' 
            AND table_schema = 'public'
        ) THEN
            RAISE NOTICE '❌ Colonne role manquante dans user_organizations';
            success := false;
        ELSE
            RAISE NOTICE '✅ Colonne role présente dans user_organizations';
        END IF;
    END IF;
    
    -- Résumé final
    RAISE NOTICE '';
    RAISE NOTICE '🎯 RÉSULTAT DE LA MIGRATION';
    RAISE NOTICE '=====================================';
    
    IF success THEN
        RAISE NOTICE '✅ MIGRATION 025 TERMINÉE AVEC SUCCÈS!';
        RAISE NOTICE '✅ La création d''organisations devrait maintenant fonctionner';
        RAISE NOTICE '';
        RAISE NOTICE '📋 Prochaines étapes:';
        RAISE NOTICE '   1. Tester la création d''organisation via l''interface';
        RAISE NOTICE '   2. Vérifier que les relations user_organizations sont créées';
        RAISE NOTICE '   3. Tester les permissions de modification/suppression';
    ELSE
        RAISE NOTICE '❌ MIGRATION 025 ÉCHOUÉE';
        RAISE NOTICE '❌ Vérifiez les erreurs ci-dessus et réessayez';
        RAISE NOTICE '';
        RAISE NOTICE '🔧 Actions recommandées:';
        RAISE NOTICE '   1. Vérifier les logs d''erreur';
        RAISE NOTICE '   2. Vérifier les permissions de la base de données';
        RAISE NOTICE '   3. Contacter l''administrateur de la base';
    END IF;
END $$;

-- 4. Afficher les informations de test
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 INFORMATIONS DE TEST';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Pour tester la migration:';
    RAISE NOTICE '   1. Exécuter: \i test_organization_creation.sql';
    RAISE NOTICE '   2. Tenter de créer une organisation via l''interface';
    RAISE NOTICE '   3. Vérifier les logs de l''application';
    RAISE NOTICE '';
    RAISE NOTICE '📞 En cas de problème:';
    RAISE NOTICE '   - Consulter ORGANIZATION_CREATION_FIX_GUIDE.md';
    RAISE NOTICE '   - Vérifier les logs de la base de données';
    RAISE NOTICE '   - Exécuter le script de test pour diagnostiquer';
END $$;
