-- Migration pour créer la table workflow_states
-- Date: 2025-01-27

-- Créer la table workflow_states pour le système de workflow
CREATE TABLE IF NOT EXISTS public.workflow_states (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    current_step text NOT NULL,
    is_completed boolean DEFAULT false,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Créer un index sur user_id pour les performances
CREATE INDEX IF NOT EXISTS idx_workflow_states_user_id ON public.workflow_states(user_id);

-- Créer un index sur current_step
CREATE INDEX IF NOT EXISTS idx_workflow_states_current_step ON public.workflow_states(current_step);

-- Activer RLS
ALTER TABLE public.workflow_states ENABLE ROW LEVEL SECURITY;

-- Créer une politique RLS simple
CREATE POLICY "Users can access their own workflow state"
    ON public.workflow_states
    FOR ALL
    USING (auth.uid() = user_id);

-- Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_workflow_states_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflow_states_timestamp
    BEFORE UPDATE ON public.workflow_states
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_states_updated_at();
