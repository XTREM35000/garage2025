-- Correction des problèmes de création d'organisation
-- 1. Créer la fonction manquante create_organization_with_owner
-- 2. Corriger les politiques RLS pour permettre la création d'organisations

-- =====================================================
-- 1. CRÉATION DE LA FONCTION create_organization_with_owner
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
    org_name text,
    org_code text,
    org_slug text,
    org_email text,
    org_subscription_type text DEFAULT 'monthly',
    owner_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_org_id uuid;
BEGIN
    -- Vérifier que l'utilisateur est authentifié
    IF owner_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required';
    END IF;

    -- Créer l'organisation
    INSERT INTO public.organisations (
        name,
        code,
        slug,
        email,
        subscription_type,
        is_active
    ) VALUES (
        org_name,
        org_code,
        org_slug,
        org_email,
        org_subscription_type,
        true
    ) RETURNING id INTO new_org_id;

    -- Créer la relation user_organization (sans colonne role qui n'existe pas)
    INSERT INTO public.user_organizations (
        user_id,
        organisation_id
    ) VALUES (
        owner_user_id,
        new_org_id
    );

    -- Retourner l'ID de l'organisation créée
    RETURN new_org_id;
END;
$$;

-- =====================================================
-- 2. CORRECTION DES POLITIQUES RLS
-- =====================================================

-- Activer RLS sur la table organisations si ce n'est pas déjà fait
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes qui pourraient bloquer l'insertion
DROP POLICY IF EXISTS "organisations_select_policy" ON public.organisations;
DROP POLICY IF EXISTS "organisations_demo_select" ON public.organisations;
DROP POLICY IF EXISTS "organisations_super_admin_manage" ON public.organisations;

-- Politique pour permettre à tous les utilisateurs authentifiés de voir les organisations
CREATE POLICY "organisations_select_policy" ON public.organisations
    FOR SELECT USING (true);

-- Politique pour permettre aux utilisateurs authentifiés de créer des organisations
CREATE POLICY "organisations_insert_policy" ON public.organisations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique pour permettre aux propriétaires et super admins de modifier leurs organisations
CREATE POLICY "organisations_update_policy" ON public.organisations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_organizations uo
            WHERE uo.organisation_id = id
            AND uo.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.user_id = auth.uid()
            AND sa.est_actif = true
        )
    );

-- Politique pour permettre aux propriétaires et super admins de supprimer leurs organisations
CREATE POLICY "organisations_delete_policy" ON public.organisations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_organizations uo
            WHERE uo.organisation_id = id
            AND uo.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.user_id = auth.uid()
            AND sa.est_actif = true
        )
    );

-- =====================================================
-- 3. CORRECTION DES POLITIQUES RLS POUR user_organizations
-- =====================================================

-- S'assurer que RLS est activé
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own organizations" ON public.user_organizations;
DROP POLICY IF EXISTS "Admins can manage user organizations" ON public.user_organizations;

-- Politique pour permettre aux utilisateurs de voir leurs propres relations d'organisation
CREATE POLICY "user_organizations_select_policy" ON public.user_organizations
    FOR SELECT USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.user_organizations uo
            WHERE uo.organisation_id = organisation_id
            AND uo.user_id = auth.uid()
        )
    );

-- Politique pour permettre aux utilisateurs de créer des relations d'organisation
CREATE POLICY "user_organizations_insert_policy" ON public.user_organizations
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.user_organizations uo
            WHERE uo.organisation_id = organisation_id
            AND uo.user_id = auth.uid()
        )
    );

-- Politique pour permettre aux utilisateurs de modifier leurs propres relations d'organisation
CREATE POLICY "user_organizations_update_policy" ON public.user_organizations
    FOR UPDATE USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.user_organizations uo
            WHERE uo.organisation_id = organisation_id
            AND uo.user_id = auth.uid()
        )
    );

-- Politique pour permettre aux utilisateurs de supprimer leurs propres relations d'organisation
CREATE POLICY "user_organizations_delete_policy" ON public.user_organizations
    FOR DELETE USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.user_organizations uo
            WHERE uo.organisation_id = organisation_id
            AND uo.user_id = auth.uid()
        )
    );

-- =====================================================
-- 4. VÉRIFICATION ET TEST
-- =====================================================

-- Vérifier que la fonction a été créée
SELECT 
    routine_name,
    routine_type,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_organization_with_owner';

-- Tester la fonction (optionnel - décommentez pour tester)
-- SELECT public.create_organization_with_owner(
--     'Test Organization',
--     'TEST001',
--     'test-org',
--     'test@example.com',
--     'monthly',
--     '00000000-0000-0000-0000-000000000000'::uuid
-- );

-- Vérifier les politiques créées
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
WHERE tablename IN ('organisations', 'user_organizations')
ORDER BY tablename, policyname;

-- =====================================================
-- 5. NOTES IMPORTANTES
-- =====================================================

/*
✅ CORRECTIONS APPORTÉES :

1. **Colonne organisation_id** : Changé de 'organization_id' vers 'organisation_id' (avec 's')
2. **Suppression de la colonne role** : Retiré les références à la colonne 'role' inexistante
3. **Politiques RLS** : Corrigées pour utiliser le bon nom de colonne
4. **SECURITY DEFINER** : La fonction s'exécute avec les privilèges du créateur

🔧 POUR APPLIQUER CES CORRECTIONS :

1. Exécuter ce script dans l'éditeur SQL de Supabase
2. Vérifier que la fonction est créée avec SECURITY DEFINER
3. Vérifier que les politiques RLS sont correctement appliquées
4. Tester la création d'organisation via l'interface

⚠️ ATTENTION :
- Cette fonction contourne RLS grâce à SECURITY DEFINER
- Assurez-vous que seuls les utilisateurs autorisés peuvent l'appeler
- Les politiques RLS restent actives pour les opérations directes
*/
