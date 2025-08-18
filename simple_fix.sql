-- Solution simple pour le problème de contrainte de clé étrangère
-- Exécuter ce script dans votre base de données Supabase

-- 1. Créer un utilisateur de test simple
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    'fe573aa3-45e2-4992-a677-dd6af7954e7f',
    'admin@gmail.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- 2. S'assurer que la colonne created_by est nullable
ALTER TABLE public.onboarding_workflow_states 
ALTER COLUMN created_by DROP NOT NULL;

-- 3. Vérifier que l'insertion fonctionne
INSERT INTO public.onboarding_workflow_states (
    current_step,
    is_completed,
    created_by
) VALUES (
    'super-admin',
    false,
    'fe573aa3-45e2-4992-a677-dd6af7954e7f'
) ON CONFLICT DO NOTHING;

-- Message de confirmation
SELECT 'Problème de contrainte résolu!' as status;
