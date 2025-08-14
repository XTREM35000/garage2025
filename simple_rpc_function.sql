-- Fonction RPC simplifiée pour créer une organisation avec admin
-- À exécuter dans le SQL Editor de Supabase

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS public.create_organisation_with_admin(jsonb, jsonb);

-- Créer une fonction simplifiée qui ne gère que l'organisation
CREATE OR REPLACE FUNCTION public.create_organisation_with_admin(
    org_data jsonb,
    admin_data jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_org_id uuid;
    new_org json;
    result json;
BEGIN
    -- 1. Créer seulement l'organisation
    INSERT INTO organisations (
        name, code, slug, email, subscription_type, is_active
    ) VALUES (
        org_data->>'name', 
        org_data->>'code', 
        org_data->>'slug', 
        org_data->>'email', 
        COALESCE(org_data->>'subscription_type', 'monthly'), 
        true
    ) RETURNING id INTO new_org_id;

    -- 2. Récupérer les données de l'organisation créée
    SELECT row_to_json(o.*) INTO new_org FROM organisations o WHERE o.id = new_org_id;

    -- 3. Retourner le résultat avec les données admin pour le frontend
    result := json_build_object(
        'organisation', new_org, 
        'admin', json_build_object(
            'email', admin_data->>'email',
            'full_name', admin_data->>'full_name',
            'password', admin_data->>'password'
        ),
        'success', true
    );
    
    RETURN result;
END;
$$;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION public.create_organisation_with_admin TO authenticated;

-- Vérifier que la fonction existe
SELECT routine_name, routine_type, data_type 
FROM information_schema.routines 
WHERE routine_name = 'create_organisation_with_admin';
