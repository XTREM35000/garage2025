import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import {
  WorkflowContextType,
  WorkflowStateData,
  WorkflowStep,
  WorkflowError,
  WORKFLOW_STEPS
} from '@/types/workflow';

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

interface WorkflowProviderProps {
  children: React.ReactNode;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ children }) => {
  const [state, setState] = useState<WorkflowStateData | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(WORKFLOW_STEPS.SUPER_ADMIN);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<WorkflowError | null>(null);

  const { user, isAuthenticated } = useAuthSession();

  // Fonction pour récupérer l'état du workflow depuis le backend
  const fetchWorkflowState = useCallback(async (): Promise<WorkflowStateData | null> => {
    if (!user?.id) return null;

    try {
      console.log('🔄 [WorkflowContext] Vérification de la logique workflow');

      // 1. D'abord vérifier s'il y a un super_admin existant
      const { data: superAdminData, error: superAdminError } = await supabase
        .from('super_admins')
        .select('*')
        .limit(1)
        .single();

      if (superAdminError && superAdminError.code !== 'PGRST116') {
        throw superAdminError;
      }

      // 2. Si pas de super_admin, rediriger vers l'étape SUPER_ADMIN
      if (!superAdminData) {
        console.log('⚠️ [WorkflowContext] Pas de super_admin détecté -> Étape SUPER_ADMIN requise');
        // Ne pas créer automatiquement, laisser l'utilisateur le faire
        return null; // Retourner null pour déclencher l'étape SUPER_ADMIN
      }

      // 3. Maintenant vérifier l'état du workflow
      const { data, error: fetchError } = await supabase
        .from('onboarding_workflow_states')
        .select('*')
        .eq('created_by', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Aucun état trouvé, créer un état initial au SUPER_ADMIN
          console.log('📝 [WorkflowContext] Création d\'un nouvel état workflow au SUPER_ADMIN');
          return await createInitialWorkflowState(user.id);
        }
        throw fetchError;
      }

      console.log('✅ [WorkflowContext] État workflow récupéré:', data);
      return data;
    } catch (err) {
      console.error('❌ [WorkflowContext] Erreur lors de la récupération:', err);
      const workflowError: WorkflowError = {
        step: 'fetch',
        type: 'rpc',
        message: err instanceof Error ? err.message : 'Erreur inconnue',
        timestamp: new Date(),
        details: err
      };
      setError(workflowError);
      return null;
    }
  }, [user?.id]);

  // Fonction pour créer un état initial du workflow
  const createInitialWorkflowState = async (userId: string): Promise<WorkflowStateData> => {
    const initialState: Partial<WorkflowStateData> = {
      created_by: userId,
      current_step: WORKFLOW_STEPS.SUPER_ADMIN, // Démarrer directement au pricing
      is_completed: false
    };

    const { data, error } = await supabase
      .from('onboarding_workflow_states')
      .insert(initialState)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de l'état initial: ${error.message}`);
    }

    console.log('✅ [WorkflowContext] Nouvel état workflow créé:', data);
    return data;
  };

  // Fonction pour mettre à jour l'étape du workflow
  const updateStep = useCallback(async (
    step: WorkflowStep,
    data?: Partial<WorkflowStateData>
  ): Promise<void> => {
    if (!user?.id) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      setIsLoading(true);
      setError(null);

      const updateData = {
        current_step: step,
        updated_at: new Date().toISOString(),
        ...data
      };

      console.log('📝 [WorkflowContext] Mise à jour workflow:', { step, data: updateData });

      const { error: updateError } = await supabase
        .from('onboarding_workflow_states')
        .update(updateData)
        .eq('created_by', user.id);

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour l'état local
      setState(prev => prev ? { ...prev, ...updateData } : null);
      setCurrentStep(step);

      console.log('✅ [WorkflowContext] Étape mise à jour avec succès:', step);
    } catch (err) {
      console.error('❌ [WorkflowContext] Erreur lors de la mise à jour:', err);
      const workflowError: WorkflowError = {
        step,
        type: 'rpc',
        message: err instanceof Error ? err.message : 'Erreur inconnue',
        timestamp: new Date(),
        details: err
      };
      setError(workflowError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fonction pour compléter une étape
  const completeStep = useCallback(async (step: WorkflowStep): Promise<void> => {
    await updateStep(step, { is_completed: true });
  }, [updateStep]);

  // Fonction pour réinitialiser le workflow
  const resetWorkflow = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('onboarding_workflow_states')
        .delete()
        .eq('created_by', user.id);

      if (error) {
        throw error;
      }

      setState(null);
      setCurrentStep(WORKFLOW_STEPS.SUPER_ADMIN);
      console.log('🔄 [WorkflowContext] Workflow réinitialisé');
    } catch (err) {
      console.error('❌ [WorkflowContext] Erreur lors de la réinitialisation:', err);
      const workflowError: WorkflowError = {
        step: 'reset',
        type: 'rpc',
        message: err instanceof Error ? err.message : 'Erreur inconnue',
        timestamp: new Date(),
        details: err
      };
      setError(workflowError);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fonction pour rafraîchir l'état
  const refresh = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const workflowState = await fetchWorkflowState();

      if (workflowState) {
        setState(workflowState);
        setCurrentStep(workflowState.current_step);
      }
    } catch (err) {
      console.error('❌ [WorkflowContext] Erreur lors du rafraîchissement:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, fetchWorkflowState]);

  // Effet pour initialiser le workflow quand l'utilisateur change
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refresh();
    } else if (!isAuthenticated) {
      setState(null);
      setCurrentStep(WORKFLOW_STEPS.SUPER_ADMIN);
      setError(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, refresh]);

  const contextValue: WorkflowContextType = {
    state,
    currentStep,
    isLoading,
    error,
    refresh,
    updateStep,
    completeStep,
    resetWorkflow
  };

  return (
    <WorkflowContext.Provider value={contextValue}>
      {children}
    </WorkflowContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useWorkflow = (): WorkflowContextType => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
