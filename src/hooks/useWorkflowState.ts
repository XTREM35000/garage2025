import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database.types';

type WorkflowStep = 'pricing' | 'create-admin' | 'create-organization' | 'sms-validation' | 'garage-setup' | 'complete';

export const useWorkflowState = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('pricing');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflowState = async () => {
      try {
        const { data, error } = await supabase
          .from('onboarding_workflow_states')
          .select('current_step')
          .maybeSingle() as unknown as {
            data: { current_step: WorkflowStep } | null;
            error: Error | null;
          };

        if (error) throw error;
        if (data) {
          setCurrentStep(data.current_step);
        }
      } catch (error) {
        console.error('Error fetching workflow state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowState();
  }, []);

  return {
    currentStep,
    isLoading,
    setCurrentStep
  };
};
