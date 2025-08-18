import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { useAuthSession } from '@/hooks/useAuthSession';
import { WORKFLOW_STEPS, WorkflowStateData } from '@/types/workflow';
import { supabase } from '@/integrations/supabase/client';

// Types stricts pour le workflow
interface WorkflowState {
  step: keyof typeof WORKFLOW_STEPS;
  data?: Record<string, any>;
  isLoading?: boolean;
  current_step?: keyof typeof WORKFLOW_STEPS;
}

interface WorkflowGuardV2Props {
  children: React.ReactNode;
}

const WorkflowGuardV2: React.FC<WorkflowGuardV2Props> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthSession();
  const { state, updateStep } = useWorkflow();

  // Vérification Super Admin optimisée
  const checkSuperAdmin = async () => {
    console.debug('[Workflow] Vérification super admin...');

    const { data, error } = await supabase
      .rpc('has_super_admin');

    if (error) {
      console.error('[Workflow] Erreur vérification:', error);
      return false;
    }

    return data;
  };

  // Point d'entrée unique du workflow
  useEffect(() => {
    const initializeWorkflow = async () => {
      console.debug('[Workflow] Initialisation...', { isAuthenticated, user });

      // 1. Vérifier super admin
      const hasSuperAdmin = await checkSuperAdmin();

      if (!hasSuperAdmin) {
        console.debug('[Workflow] Pas de super admin -> création');
        navigate('/super-admin');
        return;
      }

      // 2. Vérifier authentification
      if (!isAuthenticated) {
        console.debug('[Workflow] Auth requise');
        navigate('/auth');
        return;
      }

      // 3. Vérifier l'étape en cours
      if (!state.current_step) {
        console.debug('[Workflow] Démarrage workflow');
        await updateStep('PRICING');
        navigate('/pricing');
        return;
      }

      // 4. Continuer le workflow en cours
      console.debug('[Workflow] Reprise workflow:', state.current_step);
      navigate(`/${state.current_step}`);
    };

    initializeWorkflow();
  }, [isAuthenticated, user, state.current_step]);

  // Affichage conditionnel avec vérification de state
  if (!state || state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Si workflow terminé, afficher le contenu normal
  if (state.current_step === WORKFLOW_STEPS.COMPLETE) {
    return <>{children}</>;
  }

  // Sinon, l'utilisateur sera redirigé par les effets ci-dessus
  return null;
};

export default WorkflowGuardV2;
