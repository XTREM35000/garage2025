-- Script de diagnostic pour identifier les fonctions create_organization_with_owner
-- Date: 2025-01-27
-- Utilisation: Exécuter dans Supabase SQL Editor pour diagnostiquer le problème

-- 1. Lister toutes les fonctions avec ce nom
DO $$
DECLARE
    func_record RECORD;
    func_count integer := 0;
BEGIN
    RAISE NOTICE '🔍 DIAGNOSTIC DES FONCTIONS create_organization_with_owner';
    RAISE NOTICE '========================================================';
    
    FOR func_record IN 
        SELECT 
            p.oid,
            p.proname,
            p.pronargs,
            p.prorettype,
            n.nspname as schema_name,
            format_type(p.prorettype, NULL) as return_type,
            array_to_string(ARRAY(
                SELECT format_type(t.oid, NULL)
                FROM unnest(p.proargtypes) WITH ORDINALITY AS t(oid, ord)
                ORDER BY t.ord
            ), ', ') as arg_types
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'create_organization_with_owner'
        ORDER BY p.pronargs
    LOOP
        func_count := func_count + 1;
        RAISE NOTICE '';
        RAISE NOTICE 'Fonction #%:', func_count;
        RAISE NOTICE '  OID: %', func_record.oid;
        RAISE NOTICE '  Nom: %', func_record.proname;
        RAISE NOTICE '  Schéma: %', func_record.schema_name;
        RAISE NOTICE '  Arguments: %', func_record.pronargs;
        RAISE NOTICE '  Types d''arguments: %', func_record.arg_types;
        RAISE NOTICE '  Type de retour: %', func_record.return_type;
        RAISE NOTICE '  Commande de suppression: DROP FUNCTION IF EXISTS %s CASCADE;', 
            func_record.oid::regprocedure;
    END LOOP;
    
    IF func_count = 0 THEN
        RAISE NOTICE '✅ Aucune fonction create_organization_with_owner trouvée';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '📋 RÉSUMÉ: % fonction(s) trouvée(s)', func_count;
        RAISE NOTICE '';
        RAISE NOTICE '🔧 ACTIONS RECOMMANDÉES:';
        RAISE NOTICE '   1. Copier les commandes DROP FUNCTION ci-dessus';
        RAISE NOTICE '   2. Les exécuter une par une dans l''ordre';
        RAISE NOTICE '   3. Puis exécuter la migration 025';
    END IF;
END $$;

-- 2. Vérifier les dépendances (version simplifiée)
DO $$
DECLARE
    dep_record RECORD;
    dep_count integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VÉRIFICATION DES DÉPENDANCES';
    RAISE NOTICE '================================';
    
    -- Version simplifiée sans format_type complexe
    FOR dep_record IN 
        SELECT DISTINCT
            c.conname as constraint_name,
            c.contype as constraint_type,
            'Dépendance détectée' as info
        FROM pg_constraint c
        WHERE c.conname LIKE '%create_organization_with_owner%'
        AND c.contype IN ('f', 'p', 'u', 'c')
    LOOP
        dep_count := dep_count + 1;
        RAISE NOTICE 'Dépendance #%: % (%)', 
            dep_count, 
            dep_record.constraint_name, 
            dep_record.constraint_type;
    END LOOP;
    
    IF dep_count = 0 THEN
        RAISE NOTICE '✅ Aucune dépendance trouvée';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  ATTENTION: % dépendance(s) détectée(s)', dep_count;
        RAISE NOTICE '   Utilisez CASCADE lors de la suppression';
    END IF;
END $$;

-- 3. Commande de nettoyage automatique (optionnel)
DO $$
DECLARE
    func_oid oid;
    deleted_count integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧹 NETTOYAGE AUTOMATIQUE (optionnel)';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Voulez-vous supprimer automatiquement toutes les fonctions?';
    RAISE NOTICE 'Décommentez la section ci-dessous si oui:';
    RAISE NOTICE '';
    
    -- DÉCOMMENTER LA SECTION SUIVANTE POUR LE NETTOYAGE AUTOMATIQUE
    /*
    FOR func_oid IN 
        SELECT p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'create_organization_with_owner'
    LOOP
        RAISE NOTICE 'Suppression de la fonction OID: %', func_oid;
        EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE', func_oid::regprocedure);
        deleted_count := deleted_count + 1;
    END LOOP;
    
    RAISE NOTICE '✅ % fonction(s) supprimée(s)', deleted_count;
    */
    
    RAISE NOTICE '⚠️  Section de nettoyage automatique désactivée';
    RAISE NOTICE '   Pour l''activer, décommentez la section dans le script';
END $$;

-- 4. Instructions finales
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 INSTRUCTIONS FINALES';
    RAISE NOTICE '=======================';
    RAISE NOTICE '1. Analyser les résultats ci-dessus';
    RAISE NOTICE '2. Supprimer manuellement les fonctions problématiques';
    RAISE NOTICE '3. Exécuter la migration 025_fix_organization_creation.sql';
    RAISE NOTICE '';
    RAISE NOTICE '💡 ASTUCE: Si le nettoyage automatique échoue,';
    RAISE NOTICE '   utilisez les commandes DROP FUNCTION individuelles';
    RAISE NOTICE '   affichées dans la section 1.';
END $$;
