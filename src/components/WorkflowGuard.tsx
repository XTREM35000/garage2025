import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SplashScreen from './SplashScreen';
import InitializationWizard from './InitializationWizard';

interface WorkflowGuardProps {
  children: React.ReactNode;
}

type WorkflowState = 'loading' | 'needs-init' | 'needs-auth' | 'ready';
type InitStep = 'pricing' | 'create-admin' | 'create-organization' | 'sms-validation' | 'garage-setup';
type WorkflowStep = 'pricing' | 'create-admin' | 'create-organization' | 'sms-validation' | 'garage-setup' | 'complete' | 'ready'; // Ajoutez 'ready' aux options possibles;

const WorkflowGuard: React.FC<WorkflowGuardProps> = ({ children }) => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>('loading');
  const [initStep, setInitStep] = useState<InitStep>('pricing');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkWorkflowState();
  }, []);

  const checkWorkflowState = async () => {
    console.log('[1] 🔍 Début vérification workflow');

    try {
      // 1. Vérification de la session
      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (authError) throw authError;
      if (!session) {
        setWorkflowState('needs-auth');
        return;
      }

      // 2. Récupération du profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) throw profileError;

      // 3. Vérification du workflow state
      const { data: workflow, error: workflowError } = await supabase
        .from('onboarding_workflow_states')
        .select('current_step')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (workflowError) throw workflowError;

      // 4. Initialisation si nécessaire
      if (!workflow) {
        const { error } = await supabase
          .from('onboarding_workflow_states')
          .insert({
            profile_id: profile.id,
            current_step: 'pricing'
          });

        if (error) throw error;
        setWorkflowState('needs-init');
        setInitStep('pricing');
        return;
      }

      // 5. Gestion des états
      setWorkflowState(workflow.current_step === 'complete' ? 'ready' : 'needs-init');
      setInitStep(workflow.current_step);

    } catch (error) {
      console.error('Erreur workflow:', error);
      setWorkflowState('needs-init');
      setInitStep('pricing');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
  const initializeUserWorkflow = async (userId: string) => {
    const { error } = await supabase
      .from('onboarding_workflow_states')
      .insert({
        user_id: userId,
        current_step: 'pricing',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  };

  const updateWorkflowStep = async (userId: string, step: WorkflowStep) => {
    const { error } = await supabase
      .from('onboarding_workflow_states')
      .update({ current_step: step })
      .eq('user_id', userId);

    if (error) throw error;
  };

  const handleInitComplete = () => {
    console.log('✅ Initialisation terminée - Vérification finale');
    toast.success('Configuration terminée avec succès !');

    // Marquer comme prêt et laisser le guard faire une nouvelle vérification
    setWorkflowState('ready');

    // Délai pour permettre au système de traiter les données
    setTimeout(() => {
      checkWorkflowState(); // Re-vérifier l'état après completion
    }, 1000);
  };

  // État de chargement
  if (loading) {
    return <SplashScreen onComplete={() => setLoading(false)} />;
  }

  // Log pour debug
  console.log('[Render] État actuel:', { workflowState, initStep });

  // Rendu strict basé sur l'état
  if (workflowState === 'needs-init') {
    return (
      <InitializationWizard
        isOpen={true}
        onComplete={handleInitComplete}
        startStep={initStep as 'pricing' | 'create-admin'}
      />
    );
  }

  if (workflowState === 'needs-auth') {
    window.location.href = '/auth'; // Forcer la redirection complète
    return null;
  }

  if (workflowState === 'ready') {
    return <>{children}</>;
  }

  return null;
};

export default WorkflowGuard;