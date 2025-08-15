-- Fonction RPC pour créer une organisation avec admin
-- À exécuter dans le SQL Editor de Supabase

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS public.create_organisation_with_admin(jsonb);

-- Créer la nouvelle fonction avec un seul objet de données
CREATE OR REPLACE FUNCTION public.create_organisation_with_admin(
    org_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_org_id uuid;
    current_user_id uuid;
    new_org jsonb;
    new_profile jsonb;
    result jsonb;
BEGIN
    -- Récupérer l'ID de l'utilisateur courant
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié';
    END IF;

    -- 1. Créer l'organisation
    INSERT INTO public.organisations (
        name, 
        code,
        subscription_type,
        status
    ) VALUES (
        org_data->>'name',
        COALESCE(org_data->>'code', 'ORG012025'),
        COALESCE(org_data->>'subscription_type', 'free'),
        'active'
    ) RETURNING id INTO new_org_id;

    -- 2. Créer/Mettre à jour le profil dans profiles
    INSERT INTO public.profiles (
        id,
        user_id,
        email,
        full_name,
        role,
        organisation_id,
        status
    ) VALUES (
        current_user_id,
        current_user_id,
        org_data->>'email',
        COALESCE(org_data->>'admin_name', org_data->>'email'),
        'admin',
        new_org_id,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        organisation_id = EXCLUDED.organisation_id,
        role = EXCLUDED.role,
        updated_at = now()
    RETURNING jsonb_build_object(
        'id', id,
        'email', email,
        'full_name', full_name,
        'role', role
    ) INTO new_profile;

    -- 3. Initialiser le workflow
    INSERT INTO public.onboarding_workflow_states (
        organisation_id,
        current_step,
        is_completed,
        created_by
    ) VALUES (
        new_org_id,
        'organization_created',
        false,
        current_user_id
    );

    -- 4. Récupérer les données de l'organisation
    SELECT jsonb_build_object(
        'id', id,
        'name', name,
        'code', code,
        'subscription_type', subscription_type,
        'status', status,
        'created_at', created_at
    ) INTO new_org
    FROM public.organisations
    WHERE id = new_org_id;

    -- 5. Retourner le résultat
    result := jsonb_build_object(
        'organisation', new_org,
        'profile', new_profile,
        'status', 'success'
    );

    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'status', 'error',
        'message', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION public.create_organisation_with_admin TO authenticated;

-- Vérifier que la fonction existe
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_name = 'create_organisation_with_admin';
