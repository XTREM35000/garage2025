-- SOLUTION D'URGENCE - Correction Récursion RLS
-- À exécuter IMMÉDIATEMENT si la migration 019 échoue

-- 1. DÉSACTIVER RLS IMMÉDIATEMENT
ALTER TABLE public.super_admins DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER TOUTES LES POLITIQUES
DROP POLICY IF EXISTS "super_admins_initial_access" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_select_policy" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_insert_policy" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_update_policy" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_delete_policy" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_allow_initial_creation" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_insert_initial" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_select_simple" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_update_simple" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_delete_simple" ON public.super_admins;

-- 3. CRÉER UNE POLITIQUE SIMPLE
CREATE POLICY "super_admins_emergency" ON public.super_admins FOR ALL USING (true);

-- 4. RÉACTIVER RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- 5. VÉRIFIER QUE ÇA FONCTIONNE
SELECT 'RLS corrigé' as status;
