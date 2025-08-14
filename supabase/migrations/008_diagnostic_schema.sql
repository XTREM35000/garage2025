-- Script de diagnostic pour identifier l'état actuel du schéma
-- À exécuter pour comprendre la structure existante

-- ========================================
-- DIAGNOSTIC DES TABLES EXISTANTES
-- ========================================

-- Lister toutes les tables
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ========================================
-- DIAGNOSTIC DES COLONNES PAR TABLE
-- ========================================

-- Colonnes de la table users
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Colonnes de la table clients (si elle existe)
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;

-- Colonnes de la table vehicules (si elle existe)
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehicules'
ORDER BY ordinal_position;

-- Colonnes de la table reparations (si elle existe)
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'reparations'
ORDER BY ordinal_position;

-- Colonnes de la table pieces (si elle existe)
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pieces'
ORDER BY ordinal_position;

-- Colonnes de la table factures (si elle existe)
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'factures'
ORDER BY ordinal_position;

-- Colonnes de la table notifications (si elle existe)
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Colonnes de la table historique_actions (si elle existe)
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'historique_actions'
ORDER BY ordinal_position;

-- ========================================
-- DIAGNOSTIC DES CONTRAINTES
-- ========================================

-- Contraintes de clés étrangères
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ========================================
-- DIAGNOSTIC DES INDEX
-- ========================================

-- Index existants
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ========================================
-- DIAGNOSTIC DES SÉQUENCES
-- ========================================

-- Séquences existantes
SELECT
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

-- ========================================
-- DIAGNOSTIC DES FONCTIONS
-- ========================================

-- Fonctions existantes
SELECT
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ========================================
-- DIAGNOSTIC DES TRIGGERS
-- ========================================

-- Triggers existants
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
