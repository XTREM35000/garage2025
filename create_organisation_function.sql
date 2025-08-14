-- Fonction RPC pour créer une organisation avec admin
-- À exécuter dans le SQL Editor de Supabase

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS public.create_organisation_with_admin(jsonb, jsonb);

-- Créer la nouvelle fonction avec des objets structurés
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
    new_admin_id uuid;
    new_org json;
    new_admin json;
    result json;
BEGIN
    -- 1. Créer l'organisation
    INSERT INTO organisations (
        name, 
        code, 
        slug, 
        email, 
        subscription_type, 
        is_active
    ) VALUES (
        org_data->>'name',
        org_data->>'code',
        org_data->>'slug',
        org_data->>'email',
        COALESCE(org_data->>'subscription_type', 'monthly'),
        true
    ) RETURNING id INTO new_org_id;

    -- 2. Créer l'utilisateur admin dans auth.users
    INSERT INTO auth.users (
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        admin_data->>'email',
        crypt(admin_data->>'password', gen_salt('bf')),
        now(),
        now(),
        now(),
        jsonb_build_object(
            'provider', 'email',
            'providers', ARRAY['email'],
            'full_name', admin_data->>'full_name'
        ),
        jsonb_build_object(
            'full_name', admin_data->>'full_name'
        ),
        false,
        encode(gen_random_bytes(32), 'hex'),
        '',
        encode(gen_random_bytes(32), 'hex'),
        encode(gen_random_bytes(32), 'hex')
    ) RETURNING id INTO new_admin_id;

    -- 3. Créer l'utilisateur dans la table users
    INSERT INTO users (
        auth_user_id,
        full_name,
        email,
        role,
        organisation_id,
        is_active
    ) VALUES (
        new_admin_id,
        admin_data->>'full_name',
        admin_data->>'email',
        'proprietaire',
        new_org_id,
        true
    );

    -- 4. Créer la relation user_organisations
    INSERT INTO user_organisations (
        user_id,
        organisation_id,
        role
    ) VALUES (
        new_admin_id,
        new_org_id,
        'proprietaire'
    );

    -- 5. Récupérer les données créées
    SELECT row_to_json(o.*) INTO new_org
    FROM organisations o
    WHERE o.id = new_org_id;

    SELECT row_to_json(u.*) INTO new_admin
    FROM users u
    WHERE u.auth_user_id = new_admin_id;

    -- 6. Retourner le résultat
    result := json_build_object(
        'organisation', new_org,
        'admin', new_admin,
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
