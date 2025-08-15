-- Migration pour créer une fonction qui contourne RLS pour la création de profils
-- Cette fonction est nécessaire car les utilisateurs n'ont pas encore de profil lors de l'onboarding

-- 1. Créer la fonction pour créer des profils en contournant RLS
CREATE OR REPLACE FUNCTION public.create_profile_bypass_rls(
    p_user_id UUID,
    p_email TEXT,
    p_name TEXT,
    p_role TEXT DEFAULT 'user'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Vérifier si le profil existe déjà
    IF EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
        RAISE NOTICE 'Profil déjà existant pour l''utilisateur %', p_user_id;
        RETURN true;
    END IF;

    -- Créer le profil en contournant RLS
    INSERT INTO profiles (
        id,
        email,
        nom,
        prenom,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_email,
        p_name,
        '', -- prenom vide par défaut
        p_role,
        true,
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Profil créé avec succès pour l''utilisateur %', p_user_id;
    RETURN true;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la création du profil: %', SQLERRM;
        RETURN false;
END;
$$;

-- 2. Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_profile_bypass_rls(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_profile_bypass_rls(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- 3. Commentaire sur la fonction
COMMENT ON FUNCTION public.create_profile_bypass_rls(UUID, TEXT, TEXT, TEXT) IS 
'Fonction pour créer des profils en contournant RLS lors de l''onboarding initial';
