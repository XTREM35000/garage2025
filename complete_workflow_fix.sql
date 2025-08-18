-- Script complet pour corriger le workflow
-- Exécuter ce script dans votre base de données Supabase

-- 1. Créer la table super_admins
CREATE TABLE IF NOT EXISTS public.super_admins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Créer des index pour super_admins
CREATE UNIQUE INDEX IF NOT EXISTS idx_super_admins_user_id_unique 
    ON public.super_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_email 
    ON public.super_admins(email);

-- 3. Activer RLS pour super_admins
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins can manage super admins"
    ON public.super_admins
    FOR ALL
    USING (auth.uid() = user_id);

-- 4. Créer un trigger pour super_admins
CREATE OR REPLACE FUNCTION update_super_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_super_admins_timestamp
    BEFORE UPDATE ON public.super_admins
    FOR EACH ROW
    EXECUTE FUNCTION update_super_admins_updated_at();

-- 5. Corriger onboarding_workflow_states
-- Supprimer la colonne user_id si elle existe
ALTER TABLE public.onboarding_workflow_states DROP COLUMN IF EXISTS user_id CASCADE;

-- S'assurer que created_by existe et est nullable
ALTER TABLE public.onboarding_workflow_states 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) NULL;

-- S'assurer que is_completed existe
ALTER TABLE public.onboarding_workflow_states 
ADD COLUMN IF NOT EXISTS is_completed boolean DEFAULT false;

-- S'assurer que last_updated existe
ALTER TABLE public.onboarding_workflow_states 
ADD COLUMN IF NOT EXISTS last_updated timestamp with time zone DEFAULT now();

-- 6. Créer des index pour onboarding_workflow_states
CREATE INDEX IF NOT EXISTS idx_onboarding_workflow_states_created_by 
    ON public.onboarding_workflow_states(created_by);
CREATE INDEX IF NOT EXISTS idx_onboarding_workflow_states_current_step 
    ON public.onboarding_workflow_states(current_step);

-- 7. Corriger les politiques RLS pour onboarding_workflow_states
DROP POLICY IF EXISTS "Users can access their own workflow state" ON public.onboarding_workflow_states;
CREATE POLICY "Users can access their own workflow state"
    ON public.onboarding_workflow_states
    FOR ALL
    USING (auth.uid() = created_by);

-- 8. Créer un trigger pour onboarding_workflow_states
CREATE OR REPLACE FUNCTION update_onboarding_workflow_states_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    NEW.last_updated = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_onboarding_workflow_states_timestamp ON public.onboarding_workflow_states;
CREATE TRIGGER update_onboarding_workflow_states_timestamp
    BEFORE UPDATE ON public.onboarding_workflow_states
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_workflow_states_timestamp();

-- 9. Créer un utilisateur de test si nécessaire
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = 'fe573aa3-45e2-4992-a677-dd6af7954e7f'
    ) THEN
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
        );
        RAISE NOTICE '✅ Utilisateur de test créé';
    ELSE
        RAISE NOTICE 'ℹ️ Utilisateur existe déjà';
    END IF;
END $$;

-- 10. Message de confirmation
SELECT 'Workflow corrigé avec succès!' as status;
SELECT 'Tables créées/corrigées:' as info;
SELECT 'super_admins' as table_name UNION ALL SELECT 'onboarding_workflow_states';
