-- Script pour résoudre le problème de contrainte de clé étrangère
-- Exécuter ce script dans votre base de données Supabase

-- 1. Vérifier l'état actuel
SELECT 'État actuel de la base de données:' as info;

-- Vérifier les utilisateurs existants
SELECT 
    'Utilisateurs dans auth.users:' as table_info,
    COUNT(*) as user_count
FROM auth.users;

-- Vérifier la structure de onboarding_workflow_states
SELECT 
    'Structure de onboarding_workflow_states:' as table_info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'onboarding_workflow_states'
ORDER BY ordinal_position;

-- 2. Solution 1: Créer un utilisateur de test (RECOMMANDÉE)
DO $$
BEGIN
    -- Vérifier si l'utilisateur existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = 'fe573aa3-45e2-4992-a677-dd6af7954e7f'
    ) THEN
        -- Créer un utilisateur de test
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            confirmation_token,
            recovery_token
        ) VALUES (
            'fe573aa3-45e2-4992-a677-dd6af7954e7f',
            'admin@gmail.com',
            crypt('password123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            false,
            '',
            ''
        );
        
        RAISE NOTICE '✅ Utilisateur de test créé avec succès';
    ELSE
        RAISE NOTICE 'ℹ️ Utilisateur existe déjà';
    END IF;
END $$;

-- 3. Solution 2: Vérifier et corriger la contrainte si nécessaire
DO $$
BEGIN
    -- Vérifier si la contrainte existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'onboarding_workflow_states' 
        AND constraint_name = 'onboarding_workflow_states_created_by_fkey'
    ) THEN
        RAISE NOTICE 'ℹ️ Contrainte de clé étrangère existe';
        
        -- Vérifier si la colonne est nullable
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'onboarding_workflow_states' 
            AND column_name = 'created_by' 
            AND is_nullable = 'YES'
        ) THEN
            RAISE NOTICE '✅ Colonne created_by est nullable';
        ELSE
            RAISE NOTICE '⚠️ Colonne created_by n''est pas nullable, la rendre nullable';
            ALTER TABLE public.onboarding_workflow_states 
            ALTER COLUMN created_by DROP NOT NULL;
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Aucune contrainte de clé étrangère trouvée';
    END IF;
END $$;

-- 4. Vérifier que la table peut maintenant recevoir des données
DO $$
BEGIN
    -- Essayer d'insérer un état de test
    INSERT INTO public.onboarding_workflow_states (
        current_step,
        is_completed,
        created_by
    ) VALUES (
        'super-admin',
        false,
        'fe573aa3-45e2-4992-a677-dd6af7954e7f'
    );
    
    RAISE NOTICE '✅ Test d''insertion réussi';
    
    -- Nettoyer le test
    DELETE FROM public.onboarding_workflow_states 
    WHERE current_step = 'super-admin' 
    AND created_by = 'fe573aa3-45e2-4992-a677-dd6af7954e7f';
    
    RAISE NOTICE '✅ Données de test nettoyées';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erreur lors du test d''insertion: %', SQLERRM;
END $$;

-- 5. Afficher l'état final
SELECT 'Résumé de la correction:' as info;
SELECT 
    'Utilisateurs dans auth.users:' as table_info,
    COUNT(*) as user_count
FROM auth.users;

SELECT 'Structure finale de onboarding_workflow_states:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'onboarding_workflow_states'
ORDER BY ordinal_position;
