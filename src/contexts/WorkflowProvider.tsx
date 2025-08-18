import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import {
  WorkflowState,
  WorkflowContextType,
  WorkflowStep
} from '@/types/workflow.d';
import { getNextStep } from '@/lib/workflow';

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

const initialState: WorkflowState = {
  currentStep: 'super_admin_check',
  completedSteps: [],
  isDemo: false,
  loading: false,
  error: null
};

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkflowState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthSession();

  // Synchronisation avec Supabase
  const syncState = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('📊 [WorkflowProvider] Synchronisation état workflow pour user:', user.id);

      const { data, error: fetchError } = await supabase
        .from('workflow_states')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        console.log('✅ [WorkflowProvider] État workflow trouvé:', data);
        setState({
          currentStep: data.current_step as WorkflowStep,
          completedSteps: data.completed_steps || [],
          lastActiveOrg: data.meta?.lastActiveOrg,
          isDemo: data.meta?.isDemo || false,
          userId: data.user_id,
          metadata: data.meta
        });
      } else {
        console.log('🆕 [WorkflowProvider] Création nouvel état workflow');
        await createInitialState();
      }
    } catch (err) {
      console.error('❌ [WorkflowProvider] Erreur sync:', err);
      setError(err instanceof Error ? err.message : 'Erreur de synchronisation');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Créer l'état initial
  const createInitialState = async () => {
    if (!user?.id) return;

    try {
      // Vérifier si c'est un super admin
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');

      const newState = {
        ...initialState,
        userId: user.id,
        currentStep: isSuperAdmin ? 'pricing_selection' : 'super_admin_check' as WorkflowStep
      };

      const { error: insertError } = await supabase
        .from('workflow_states')
        .insert({
          user_id: user.id,
          current_step: newState.currentStep,
          completed_steps: newState.completedSteps,
          meta: { isDemo: newState.isDemo }
        });

      if (insertError) throw insertError;

      setState(newState);
      console.log('✅ [WorkflowProvider] État initial créé:', newState);
    } catch (err) {
      console.error('❌ [WorkflowProvider] Erreur création état:', err);
      setError(err instanceof Error ? err.message : 'Erreur de création');
    }
  };

  // Compléter une étape
  const completeStep = useCallback(async (step: WorkflowStep) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const nextStep = getNextStep(step);
      const newCompletedSteps = [...state.completedSteps];

      if (!newCompletedSteps.includes(step)) {
        newCompletedSteps.push(step);
      }

      const newState = {
        ...state,
        currentStep: nextStep,
        completedSteps: newCompletedSteps
      };

      console.log('🎯 [WorkflowProvider] Progression:', step, '→', nextStep);

      const { error: updateError } = await supabase
        .from('workflow_states')
        .upsert({
          user_id: user.id,
          current_step: nextStep,
          completed_steps: newCompletedSteps,
          meta: state.metadata || {},
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      setState(newState);
      console.log('✅ [WorkflowProvider] Étape complétée:', newState);
    } catch (err) {
      console.error('❌ [WorkflowProvider] Erreur progression:', err);
      setError(err instanceof Error ? err.message : 'Erreur de progression');
    } finally {
      setIsLoading(false);
    }
  }, [state, user?.id]);

  // Validation flexible des champs
  const validateFormField = useCallback((field: string, value: string) => {
    switch (field) {
      case 'email':
        // Validation souple : 2 caractères minimum, @ optionnel
        const isValid = value.length >= 2;
        return {
          isValid,
          error: isValid ? undefined : 'Email trop court (min 2 caractères)'
        };
      case 'password':
        const passwordValid = value.length >= 8;
        return {
          isValid: passwordValid,
          error: passwordValid ? undefined : 'Mot de passe trop court (min 8 caractères)'
        };
      case 'name':
        const nameValid = value.trim().length > 0;
        return {
          isValid: nameValid,
          error: nameValid ? undefined : 'Nom requis'
        };
      case 'phone':
        const phoneValid = /^\+?\d{8,15}$/.test(value);
        return {
          isValid: phoneValid,
          error: phoneValid ? undefined : 'Numéro de téléphone invalide'
        };
      default:
        return { isValid: true };
    }
  }, []);

  // Reset workflow
  const reset = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('workflow_states')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setState(initialState);
      console.log('🔄 [WorkflowProvider] Workflow réinitialisé');
    } catch (err) {
      console.error('❌ [WorkflowProvider] Erreur reset:', err);
      setError(err instanceof Error ? err.message : 'Erreur de réinitialisation');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Sync automatique au changement d'utilisateur
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      syncState();
    } else if (!isAuthenticated) {
      setState(initialState);
      setIsLoading(false);
      setError(null);
    }
  }, [isAuthenticated, user?.id, syncState]);

  const contextValue: WorkflowContextType = {
    state,
    completeStep,
    reset,
    isLoading,
    error,
    validateFormField
  };

  return (
    <WorkflowContext.Provider value={contextValue}>
      {children}
    </WorkflowContext.Provider>
  );
}

export const useWorkflow = (): WorkflowContextType => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};