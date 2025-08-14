-- Script de diagnostic SIMPLE pour les fonctions create_organization_with_owner
-- Date: 2025-01-27
-- Utilisation: Exécuter dans Supabase SQL Editor

-- 1. Compter les fonctions existantes
DO $$
DECLARE
    func_count integer;
BEGIN
    RAISE NOTICE '🔍 DIAGNOSTIC SIMPLE DES FONCTIONS create_organization_with_owner';
    RAISE NOTICE '================================================================';
    
    SELECT COUNT(*)
    INTO func_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'create_organization_with_owner';
    
    RAISE NOTICE '📊 Nombre de fonctions trouvées: %', func_count;
    
    IF func_count = 0 THEN
        RAISE NOTICE '✅ Aucune fonction à supprimer';
        RAISE NOTICE '🚀 Vous pouvez directement exécuter la migration 025';
    ELSE
        RAISE NOTICE '⚠️  % fonction(s) à supprimer', func_count;
        RAISE NOTICE '';
        RAISE NOTICE '🔧 EXÉCUTEZ LE SCRIPT DE NETTOYAGE SUIVANT';
    END IF;
END $$;

-- 2. Script de nettoyage automatique
DO $$
DECLARE
    func_oid oid;
    deleted_count integer := 0;
    total_count integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧹 NETTOYAGE AUTOMATIQUE DES FONCTIONS';
    RAISE NOTICE '=====================================';
    
    -- Compter le total
    SELECT COUNT(*)
    INTO total_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'create_organization_with_owner';
    
    IF total_count = 0 THEN
        RAISE NOTICE 'ℹ️  Aucune fonction à nettoyer';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Suppression de % fonction(s)...', total_count;
    
    -- Supprimer toutes les fonctions avec ce nom
    FOR func_oid IN 
        SELECT p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'create_organization_with_owner'
    LOOP
        BEGIN
            RAISE NOTICE 'Suppression de la fonction OID: %', func_oid;
            EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE', func_oid::regprocedure);
            deleted_count := deleted_count + 1;
            RAISE NOTICE '  ✅ Supprimée avec succès';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  ❌ Erreur: %', SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 RÉSULTAT DU NETTOYAGE';
    RAISE NOTICE '========================';
    RAISE NOTICE '✅ % fonction(s) supprimée(s) sur %', deleted_count, total_count;
    
    IF deleted_count = total_count THEN
        RAISE NOTICE '✅ Nettoyage terminé avec succès';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Vous pouvez maintenant exécuter la migration 025';
    ELSE
        RAISE NOTICE '⚠️  Nettoyage partiel - % erreur(s)', total_count - deleted_count;
        RAISE NOTICE '🔧 Vérifiez les erreurs ci-dessus';
    END IF;
END $$;

-- 3. Vérification finale
DO $$
DECLARE
    remaining_count integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VÉRIFICATION FINALE';
    RAISE NOTICE '=====================';
    
    SELECT COUNT(*)
    INTO remaining_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'create_organization_with_owner';
    
    IF remaining_count = 0 THEN
        RAISE NOTICE '✅ SUCCÈS: Aucune fonction create_organization_with_owner restante';
        RAISE NOTICE '✅ Le nettoyage est complet';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 PROCHAINES ÉTAPES:';
        RAISE NOTICE '   1. Exécuter la migration 025_fix_organization_creation.sql';
        RAISE NOTICE '   2. Tester la création d''organisation';
    ELSE
        RAISE NOTICE '❌ ÉCHEC: % fonction(s) restante(s)', remaining_count;
        RAISE NOTICE '❌ Le nettoyage n''est pas complet';
        RAISE NOTICE '';
        RAISE NOTICE '🔧 Actions recommandées:';
        RAISE NOTICE '   1. Vérifier les erreurs ci-dessus';
        RAISE NOTICE '   2. Essayer de supprimer manuellement les fonctions restantes';
        RAISE NOTICE '   3. Contacter l''administrateur si le problème persiste';
    END IF;
END $$;
