-- Supprimer les politiques existantes
DROP POLICY IF EXISTS temp_signup_policy ON auth.users;
DROP POLICY IF EXISTS "Admins can manage workflow states" ON public.onboarding_workflow_states;

-- Créer la table onboarding_workflow_states si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.onboarding_workflow_states (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organisation_id uuid REFERENCES public.organisations(id) NULL, -- Nullable pour le workflow initial
    current_step text NOT NULL CHECK (current_step IN ('pricing', 'create-admin', 'create-organization', 'sms-validation', 'garage-setup', 'complete')),
    is_completed boolean DEFAULT false,
    last_updated timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) NULL, -- Nullable pour le workflow initial
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Ajout d'un index pour améliorer les performances des requêtes sur current_step
CREATE INDEX IF NOT EXISTS idx_workflow_current_step ON public.onboarding_workflow_states(current_step);

-- Configuration pour démarrer directement au pricing, sans super-admin
DO $$
BEGIN
    -- Supprimer tout état de workflow existant
    DELETE FROM public.onboarding_workflow_states;

    -- Créer un état de workflow initial au pricing
    INSERT INTO public.onboarding_workflow_states (
        current_step,
        is_completed
    ) VALUES (
        'pricing',
        false
    );

    RAISE NOTICE 'Application configurée pour démarrer directement au pricing';
END $$;

-- Activer RLS sur la table
ALTER TABLE public.onboarding_workflow_states ENABLE ROW LEVEL SECURITY;

-- Créer une politique permissive temporaire pour auth.users
-- Cette politique permet l'inscription initiale
CREATE POLICY temp_signup_policy ON auth.users
    FOR INSERT
    WITH CHECK (true);

-- Créer une politique RLS pour la gestion du workflow
CREATE POLICY "Admins can manage workflow states"
    ON public.onboarding_workflow_states
    FOR ALL
    USING (
        (organisation_id IS NULL) -- Permettre l'accès aux états initiaux sans organisation
        OR 
        (auth.uid() IN (
            SELECT user_id 
            FROM public.user_organizations 
            WHERE role = 'admin' 
            AND organisation_id = onboarding_workflow_states.organisation_id
        ))
    );

-- Créer une fonction trigger pour mettre à jour automatiquement last_updated
CREATE OR REPLACE FUNCTION update_workflow_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = now();
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour la mise à jour automatique des timestamps
DROP TRIGGER IF EXISTS update_workflow_timestamp ON public.onboarding_workflow_states;
CREATE TRIGGER update_workflow_timestamp
    BEFORE UPDATE ON public.onboarding_workflow_states
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_timestamp();
