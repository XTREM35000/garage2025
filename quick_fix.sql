-- Script rapide pour corriger le problème de contrainte user_id
-- Exécuter ce script dans votre base de données Supabase

-- 1. Supprimer la colonne user_id problématique
ALTER TABLE public.onboarding_workflow_states DROP COLUMN IF EXISTS user_id CASCADE;

-- 2. S'assurer que created_by existe et est nullable
ALTER TABLE public.onboarding_workflow_states 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) NULL;

-- 3. S'assurer que is_completed existe
ALTER TABLE public.onboarding_workflow_states 
ADD COLUMN IF NOT EXISTS is_completed boolean DEFAULT false;

-- 4. S'assurer que last_updated existe
ALTER TABLE public.onboarding_workflow_states 
ADD COLUMN IF NOT EXISTS last_updated timestamp with time zone DEFAULT now();

-- 5. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_onboarding_workflow_states_created_by 
    ON public.onboarding_workflow_states(created_by);

-- 6. Mettre à jour la politique RLS
DROP POLICY IF EXISTS "Users can access their own workflow state" ON public.onboarding_workflow_states;
CREATE POLICY "Users can access their own workflow state"
    ON public.onboarding_workflow_states
    FOR ALL
    USING (auth.uid() = created_by);

-- Message de confirmation
SELECT 'Problème user_id corrigé avec succès!' as status;

