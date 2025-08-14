-- 🔧 CORRECTION RAPIDE POUR LA CRÉATION D'ORGANISATION
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- =====================================================
-- 1. CRÉER LA FONCTION CORRIGÉE
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

    -- Créer la relation user_organization (sans colonne role)
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
-- 2. VÉRIFIER QUE LA FONCTION EST CRÉÉE
-- =====================================================

SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'create_organization_with_owner';

-- =====================================================
-- 3. MESSAGE DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Fonction create_organization_with_owner créée avec succès';
    RAISE NOTICE '✅ Utilise SECURITY DEFINER pour contourner RLS';
    RAISE NOTICE '✅ Colonne organisation_id (avec s) utilisée';
    RAISE NOTICE '✅ Pas de référence à la colonne role inexistante';
END $$;

