-- Script de nettoyage manuel pour les fonctions create_organization_with_owner
-- Date: 2025-01-27
-- Utilisation: Exécuter dans Supabase SQL Editor pour nettoyer avant la migration

-- ATTENTION: Ce script supprime TOUTES les fonctions avec ce nom
-- Assurez-vous de sauvegarder votre base de données si nécessaire

-- 1. Identifier et supprimer toutes les fonctions
DO $$
DECLARE
    func_oid oid;
    func_signature text;
    deleted_count integer := 0;
BEGIN
    RAISE NOTICE '🧹 NETTOYAGE MANUEL DES FONCTIONS create_organization_with_owner';
    RAISE NOTICE '================================================================';
    
    -- Supprimer toutes les fonctions avec ce nom en utilisant leur OID
    FOR func_oid IN 
        SELECT p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'create_organization_with_owner'
        ORDER BY p.pronargs
    LOOP
        -- Obtenir la signature pour le log
        SELECT format('%s(%s)', p.proname, 
               CASE 
                   WHEN p.pronargs = 0 THEN ''
                   ELSE array_to_string(ARRAY(
                       SELECT format_type(t.oid, NULL)
                       FROM unnest(p.proargtypes) WITH ORDINALITY AS t(oid, ord)
                       ORDER BY t.ord
                   ), ', ')
               END)
        INTO func_signature
        FROM pg_proc p
        WHERE p.oid = func_oid;
        
        RAISE NOTICE 'Suppression de la fonction: % (OID: %)', func_signature, func_oid;
        
        BEGIN
            -- Supprimer par OID pour éviter l'ambiguïté
            EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE', func_oid::regprocedure);
            deleted_count := deleted_count + 1;
            RAISE NOTICE '  ✅ Supprimée avec succès';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  ❌ Erreur lors de la suppression: %', SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 RÉSULTAT DU NETTOYAGE';
    RAISE NOTICE '========================';
    RAISE NOTICE '✅ % fonction(s) supprimée(s)', deleted_count;
    
    IF deleted_count = 0 THEN
        RAISE NOTICE 'ℹ️  Aucune fonction à supprimer';
    ELSE
        RAISE NOTICE '✅ Nettoyage terminé avec succès';
        RAISE NOTICE '';
        RAISE NOTICE '📋 PROCHAINES ÉTAPES:';
        RAISE NOTICE '   1. Vérifier qu''aucune fonction n''existe plus';
        RAISE NOTICE '   2. Exécuter la migration 025_fix_organization_creation.sql';
    END IF;
END $$;

-- 2. Vérification post-nettoyage
DO $$
DECLARE
    remaining_count integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VÉRIFICATION POST-NETTOYAGE';
    RAISE NOTICE '==============================';
    
    SELECT COUNT(*)
    INTO remaining_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'create_organization_with_owner';
    
    IF remaining_count = 0 THEN
        RAISE NOTICE '✅ Aucune fonction create_organization_with_owner restante';
        RAISE NOTICE '✅ Le nettoyage est complet';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Vous pouvez maintenant exécuter la migration 025';
    ELSE
        RAISE NOTICE '⚠️  ATTENTION: % fonction(s) restante(s)', remaining_count;
        RAISE NOTICE '❌ Le nettoyage n''est pas complet';
        RAISE NOTICE '';
        RAISE NOTICE '🔧 Actions recommandées:';
        RAISE NOTICE '   1. Vérifier les erreurs ci-dessus';
        RAISE NOTICE '   2. Exécuter le script diagnostic_functions.sql';
        RAISE NOTICE '   3. Supprimer manuellement les fonctions restantes';
    END IF;
END $$;
