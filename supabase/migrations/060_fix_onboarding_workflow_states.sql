-- Migration pour corriger la structure de onboarding_workflow_states
-- Date: 2025-01-27

-- Vérifier et corriger la structure de la table
DO $$
BEGIN
    -- Vérifier si la colonne is_completed existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'onboarding_workflow_states' 
        AND column_name = 'is_completed'
    ) THEN
        -- Ajouter la colonne manquante
        ALTER TABLE public.onboarding_workflow_states 
        ADD COLUMN is_completed boolean DEFAULT false;
        
        RAISE NOTICE 'Colonne is_completed ajoutée à onboarding_workflow_states';
    END IF;
    
    -- Vérifier si la colonne created_by existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'onboarding_workflow_states' 
        AND column_name = 'created_by'
    ) THEN
        -- Ajouter la colonne manquante
        ALTER TABLE public.onboarding_workflow_states 
        ADD COLUMN created_by uuid REFERENCES auth.users(id) NULL;
        
        RAISE NOTICE 'Colonne created_by ajoutée à onboarding_workflow_states';
    END IF;
    
    -- Vérifier si la colonne last_updated existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'onboarding_workflow_states' 
        AND column_name = 'last_updated'
    ) THEN
        -- Ajouter la colonne manquante
        ALTER TABLE public.onboarding_workflow_states 
        ADD COLUMN last_updated timestamp with time zone DEFAULT now();
        
        RAISE NOTICE 'Colonne last_updated ajoutée à onboarding_workflow_states';
    END IF;
END $$;

-- Créer des index pour les performances s'ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_onboarding_workflow_states_created_by 
    ON public.onboarding_workflow_states(created_by);
CREATE INDEX IF NOT EXISTS idx_onboarding_workflow_states_current_step 
    ON public.onboarding_workflow_states(current_step);

-- Vérifier et corriger les politiques RLS
DO $$
BEGIN
    -- Supprimer les anciennes politiques si elles existent
    DROP POLICY IF EXISTS "Admins can manage workflow states" ON public.onboarding_workflow_states;
    DROP POLICY IF EXISTS "Users can access their own workflow state" ON public.onboarding_workflow_states;
    
    -- Créer une nouvelle politique simple
    CREATE POLICY "Users can access their own workflow state"
        ON public.onboarding_workflow_states
        FOR ALL
        USING (auth.uid() = created_by);
        
    RAISE NOTICE 'Politique RLS mise à jour pour onboarding_workflow_states';
END $$;

-- Créer un trigger pour mettre à jour updated_at et last_updated
CREATE OR REPLACE FUNCTION update_onboarding_workflow_states_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    NEW.last_updated = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS update_onboarding_workflow_states_timestamp ON public.onboarding_workflow_states;

-- Créer le nouveau trigger
CREATE TRIGGER update_onboarding_workflow_states_timestamp
    BEFORE UPDATE ON public.onboarding_workflow_states
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_workflow_states_timestamp();

-- Message de confirmation
SELECT 'Table onboarding_workflow_states corrigée avec succès!' as status;
