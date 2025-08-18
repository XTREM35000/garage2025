-- Migration pour corriger la contrainte user_id dans onboarding_workflow_states
-- Date: 2025-01-27

-- 1. Vérifier et supprimer la colonne user_id si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'onboarding_workflow_states' 
        AND column_name = 'user_id'
    ) THEN
        -- Supprimer d'abord les contraintes de clé étrangère
        ALTER TABLE public.onboarding_workflow_states 
        DROP CONSTRAINT IF EXISTS onboarding_workflow_states_user_id_fkey;
        
        -- Supprimer la colonne
        ALTER TABLE public.onboarding_workflow_states DROP COLUMN user_id;
        
        RAISE NOTICE 'Colonne user_id supprimée avec succès';
    ELSE
        RAISE NOTICE 'Colonne user_id n''existe pas, aucune action nécessaire';
    END IF;
END $$;

-- 2. Vérifier et corriger la colonne created_by
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'onboarding_workflow_states' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.onboarding_workflow_states 
        ADD COLUMN created_by uuid REFERENCES auth.users(id) NULL;
        RAISE NOTICE 'Colonne created_by ajoutée';
    ELSE
        RAISE NOTICE 'Colonne created_by existe déjà';
    END IF;
END $$;

-- 3. Vérifier et corriger la colonne is_completed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'onboarding_workflow_states' 
        AND column_name = 'is_completed'
    ) THEN
        ALTER TABLE public.onboarding_workflow_states 
        ADD COLUMN is_completed boolean DEFAULT false;
        RAISE NOTICE 'Colonne is_completed ajoutée';
    ELSE
        RAISE NOTICE 'Colonne is_completed existe déjà';
    END IF;
END $$;

-- 4. Vérifier et corriger la colonne last_updated
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'onboarding_workflow_states' 
        AND column_name = 'last_updated'
    ) THEN
        ALTER TABLE public.onboarding_workflow_states 
        ADD COLUMN last_updated timestamp with time zone DEFAULT now();
        RAISE NOTICE 'Colonne last_updated ajoutée';
    ELSE
        RAISE NOTICE 'Colonne last_updated existe déjà';
    END IF;
END $$;

-- 5. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_onboarding_workflow_states_created_by 
    ON public.onboarding_workflow_states(created_by);
CREATE INDEX IF NOT EXISTS idx_onboarding_workflow_states_current_step 
    ON public.onboarding_workflow_states(current_step);

-- 6. Vérifier et corriger les politiques RLS
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
        
    RAISE NOTICE 'Politique RLS mise à jour';
END $$;

-- 7. Créer un trigger pour mettre à jour updated_at et last_updated
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

-- 8. Afficher la structure finale
SELECT 'Migration terminée avec succès!' as status;
SELECT 'Structure finale de la table onboarding_workflow_states:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'onboarding_workflow_states'
ORDER BY ordinal_position;
