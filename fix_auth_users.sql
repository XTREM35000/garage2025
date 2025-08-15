-- Activer l'extension pgcrypto si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Créer un super admin directement
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Supprimer d'abord les enregistrements existants
    DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'superadmin@gmail.com');
    DELETE FROM public.profiles WHERE email = 'superadmin@gmail.com';
    DELETE FROM auth.users WHERE email = 'superadmin@gmail.com';
END $$;

-- Maintenant créer le nouveau super admin
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Générer un UUID fixe pour la cohérence
    v_user_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    -- Insérer dans auth.users
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        role,
        is_super_admin
    ) VALUES (
        v_user_id,
        'superadmin@gmail.com',
        crypt('SuperAdmin2025!', gen_salt('bf')),
        now(),
        'authenticated',
        true
    );

    -- Insérer dans public.profiles
    INSERT INTO public.profiles (
        id,
        user_id,
        email,
        full_name,
        role,
        is_active
    ) VALUES (
        v_user_id,
        v_user_id,
        'superadmin@gmail.com',
        'Super Admin',
        'superadmin',
        true
    );

    -- Insérer dans auth.identities
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        v_user_id,
        jsonb_build_object(
            'sub', v_user_id,
            'email', 'superadmin@gmail.com'
        ),
        'email',
        now(),
        now(),
        now()
    );

    RAISE NOTICE 'Super admin créé avec succès';
    RAISE NOTICE 'Email: superadmin@gmail.com';
    RAISE NOTICE 'Mot de passe: SuperAdmin2025!';
END $$;

-- Nettoyer tous les triggers et fonctions existants
DROP TRIGGER IF EXISTS sync_profile_active_status_trigger ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS sync_user_profile_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS before_insert_profiles_trigger ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS sync_active_status ON public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.sync_profile_active_status() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_profile() CASCADE;

-- Création directe du profil avec gestion des contraintes
CREATE OR REPLACE FUNCTION public.create_initial_user_profile(
    p_user_id uuid,
    p_user_email text,
    p_user_full_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Vérifier si le profil existe déjà
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
        -- Créer le profil avec les valeurs par défaut appropriées
        INSERT INTO profiles (
            id,
            user_id,
            email,
            full_name,
            is_active,
            role,
            created_at,
            updated_at
        )
        VALUES (
            p_user_id,
            p_user_id,  -- user_id est le même que id dans ce cas
            p_user_email,
            p_user_full_name,
            true,
            'superadmin',  -- définir le rôle comme superadmin
            now(),
            now()
        );
    END IF;
    -- Si le profil existe déjà, ne rien faire
END;
$$;

-- Création du super-admin via la fonction rpc
CREATE OR REPLACE FUNCTION public.create_initial_super_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Vérifier si l'utilisateur existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = 'superadmin@gmail.com'
    ) THEN
        -- Générer un UUID pour l'utilisateur
        v_user_id := gen_random_uuid();
        
        -- Insérer l'utilisateur via auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            role,
            is_super_admin,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        )
        VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            'superadmin@gmail.com',
            crypt('SuperAdmin2025!', gen_salt('bf')),
            now(),
            'authenticated',
            true,
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Super Admin"}',
            now(),
            now()
        );
        
        -- Créer le profil manuellement
        PERFORM create_initial_user_profile(v_user_id, 'superadmin@gmail.com', 'Super Admin');
        
        RAISE NOTICE 'Super-admin créé avec succès';
    ELSE
        RAISE NOTICE 'Le super-admin existe déjà';
    END IF;
END;
$$;

-- Exécuter la fonction
SELECT public.create_initial_super_admin();

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.create_initial_super_admin() TO service_role;
