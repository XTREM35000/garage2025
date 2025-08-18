import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkflow } from '@/contexts/WorkflowProvider';
import { useAuthSession } from '@/hooks/useAuthSession';
import { WorkflowStep } from '@/types/workflow';

interface WorkflowSyncOptions {
  enableAutoProgress?: boolean;
  silentMode?: boolean;
  retryAttempts?: number;
}

export function useWorkflowSync(options: WorkflowSyncOptions = {}) {
  const { 
    enableAutoProgress = true, 
    silentMode = false, 
    retryAttempts = 3 
  } = options;
  
  const { state, completeStep, isLoading } = useWorkflow();
  const { user, session, isAuthenticated } = useAuthSession();
  const attemptCountRef = useRef<Map<string, number>>(new Map());

  // Vérification intelligente des étapes
  const checkStepCompletion = useCallback(async (step: WorkflowStep): Promise<boolean> => {
    if (!session?.user || isLoading) return false;

    try {
      console.log(`🔍 [WorkflowSync] Vérification étape: ${step}`);

      switch (step) {
        case 'super_admin_check': {
          const { data: isSuperAdmin, error } = await supabase.rpc('is_super_admin');
          if (error) throw error;
          return !!isSuperAdmin;
        }

        case 'admin_creation': {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          return profile?.role === 'admin';
        }

        case 'org_creation': {
          const { data: organizations } = await supabase
            .from('user_organisations')
            .select('organisation_id, role')
            .eq('user_id', session.user.id);
          return organizations && organizations.length > 0;
        }

        case 'sms_validation': {
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone_verified')
            .eq('id', session.user.id)
            .maybeSingle();
          return profile?.phone_verified === true;
        }

        case 'garage_setup': {
          const { data: garages } = await supabase
            .from('garages')
            .select('id')
            .limit(1);
          return garages && garages.length > 0;
        }

        default:
          return false;
      }
    } catch (error) {
      console.error(`❌ [WorkflowSync] Erreur vérification ${step}:`, error);
      return false;
    }
  }, [session, isLoading]);

  // Progression automatique avec retry
  const attemptStepProgression = useCallback(async (step: WorkflowStep) => {
    const stepKey = `${step}-${session?.user?.id}`;
    const attempts = attemptCountRef.current.get(stepKey) || 0;

    if (attempts >= retryAttempts) {
      console.warn(`⚠️ [WorkflowSync] Limite de tentatives atteinte pour ${step}`);
      return;
    }

    attemptCountRef.current.set(stepKey, attempts + 1);

    try {
      const isCompleted = await checkStepCompletion(step);
      
      if (isCompleted && state.currentStep === step) {
        if (!silentMode) {
          console.log(`✅ [WorkflowSync] Progression automatique: ${step}`);
        }
        
        await completeStep(step);
        
        // Reset du compteur après succès
        attemptCountRef.current.delete(stepKey);
      }
    } catch (error) {
      console.error(`❌ [WorkflowSync] Erreur progression ${step}:`, error);
      
      // Retry avec délai exponentiel
      const delay = Math.pow(2, attempts) * 1000;
      setTimeout(() => {
        attemptStepProgression(step);
      }, delay);
    }
  }, [state.currentStep, completeStep, checkStepCompletion, retryAttempts, silentMode, session?.user?.id]);

  // Synchronisation complète du workflow
  const syncWorkflow = useCallback(async () => {
    if (!isAuthenticated || !session?.user || isLoading) return;

    try {
      if (!silentMode) {
        console.log(`🔄 [WorkflowSync] Synchronisation complète pour: ${session.user.email}`);
      }

      // Vérifier les étapes dans l'ordre
      const workflowSteps: WorkflowStep[] = [
        'super_admin_check',
        'admin_creation', 
        'org_creation',
        'sms_validation',
        'garage_setup'
      ];

      for (const step of workflowSteps) {
        // Vérifier seulement l'étape courante et les suivantes
        if (state.currentStep === step) {
          const isCompleted = await checkStepCompletion(step);
          
          if (isCompleted && enableAutoProgress) {
            await attemptStepProgression(step);
            break; // Progresser une étape à la fois
          }
        }
      }
    } catch (error) {
      console.error('❌ [WorkflowSync] Erreur synchronisation:', error);
    }
  }, [
    isAuthenticated, 
    session?.user, 
    state.currentStep, 
    isLoading, 
    checkStepCompletion, 
    enableAutoProgress, 
    attemptStepProgression,
    silentMode
  ]);

  // Hook pour validation manuelle d'étape
  const validateCurrentStep = useCallback(async () => {
    if (!state.currentStep) return false;
    return await checkStepCompletion(state.currentStep);
  }, [state.currentStep, checkStepCompletion]);

  // Auto-sync périodique
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isAuthenticated && enableAutoProgress && !isLoading) {
      // Sync immédiat
      syncWorkflow();
      
      // Sync périodique toutes les 5 secondes
      intervalId = setInterval(syncWorkflow, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, enableAutoProgress, isLoading, syncWorkflow]);

  // Nettoyage des tentatives lors du changement d'utilisateur
  useEffect(() => {
    if (!session?.user) {
      attemptCountRef.current.clear();
    }
  }, [session?.user]);

  return {
    syncWorkflow,
    checkStepCompletion,
    validateCurrentStep,
    attemptStepProgression,
    isLoading
  };
}