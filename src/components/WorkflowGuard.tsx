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
type WorkflowStep = 'pricing' | 'create-admin' | 'create-organization' | 'sms-validation' | 'garage-setup' | 'complete';

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
      // Vérifier l'état du workflow dans la base de données
      const { data: workflowData, error: workflowError } = await supabase
        .from('onboarding_workflow_states')
        .select('current_step')
        .maybeSingle() as unknown as {
          data: { current_step: WorkflowStep } | null;
          error: Error | null;
        };

      if (workflowError) {
        console.error('[2] ❌ Erreur vérification workflow:', workflowError);
        throw new Error('Erreur vérification workflow');
      }

      // Si pas d'état de workflow ou si l'étape est pricing, on commence par là
      if (!workflowData || workflowData.current_step === 'pricing') {
        console.log('[3] ℹ️ Démarrage au pricing');
        setWorkflowState('needs-init');
        setInitStep('pricing');
        return;
      }

      // 2. Vérification de la session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[5] 🔐 Session:', session ? 'Active' : 'Inactive');

      if (!session) {
        console.log('[6] 🚫 Pas de session → Auth requise');
        setWorkflowState('needs-auth');
        return;
      }

      // 3. Vérification des organisations
      const { count: orgCount, error: orgError } = await supabase
        .from('organisations')
        .select('*', { count: 'exact', head: true });

      console.log('[7] 🏢 Nombre d\'organisations:', orgCount);

      if (orgError) {
        console.error('[8] ❌ Erreur vérification organisations:', orgError);
        throw new Error('Erreur vérification organisations');
      }

      // 4. Décision finale basée sur l'état
      if (orgCount === 0) {
        console.log('[9] ℹ️ Aucune organisation → Création admin');
        setWorkflowState('needs-init');
        setInitStep('create-admin');
      } else {
        console.log('[10] ✅ Système initialisé → Ready');
        setWorkflowState('ready');
      }

    } catch (error) {
      console.error('[ERROR CRITIQUE] Workflow guard:', error);
      // En cas d'erreur, on force l'initialisation
      setWorkflowState('needs-init');
      setInitStep('pricing');
    } finally {
      setLoading(false);
    }
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