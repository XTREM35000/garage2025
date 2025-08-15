-- Supprimer la politique temporaire si elle existe
DROP POLICY IF EXISTS temp_signup_policy ON auth.users;

-- Créer la table onboarding_workflow_states si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.onboarding_workflow_states (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organisation_id uuid REFERENCES public.organisations(id) NULL, -- Rendre nullable pour le workflow initial
    current_step text NOT NULL,
    is_completed boolean DEFAULT false,
    last_updated timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) NULL, -- Rendre nullable pour le workflow initial
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

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

-- Créer une politique permissive temporaire pour auth.users
CREATE POLICY temp_signup_policy ON auth.users
    FOR INSERT
    WITH CHECK (true);

-- Créer des politiques RLS pour la nouvelle table
ALTER TABLE public.onboarding_workflow_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage workflow states" ON public.onboarding_workflow_states;

CREATE POLICY "Admins can manage workflow states"
    ON public.onboarding_workflow_states
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.user_organizations 
            WHERE role = 'admin' 
            AND organisation_id = organisation_id
        )
    );
