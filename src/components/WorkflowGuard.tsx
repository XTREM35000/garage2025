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
type InitStep = 'super-admin' | 'pricing' | 'create-admin' | 'create-organization' | 'sms-validation' | 'garage-setup';

const WorkflowGuard: React.FC<WorkflowGuardProps> = ({ children }) => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>('loading');
  const [initStep, setInitStep] = useState<InitStep>('super-admin');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkWorkflowState();
  }, []);

  const checkWorkflowState = async () => {
    console.log('[1] 🔍 Début vérification workflow');

    try {
      // 1. Vérification des super admins
      const { data: superAdmins, error: adminError } = await supabase
        .from('super_admins')
        .select('id, est_actif')
        .eq('est_actif', true)
        .limit(1);

      console.log('[2] 📊 Résultat super_admins:', { superAdmins, adminError });

      // Gestion erreur super_admins
      if (adminError) {
        console.error('[3] ❌ Erreur vérification super_admins:', adminError);
        throw new Error('Erreur vérification super_admins');
      }

      // Si pas de super admin actif, initialisation requise
      if (!superAdmins || superAdmins.length === 0) {
        console.log('[4] ℹ️ Aucun super admin trouvé → Initialisation');
        setWorkflowState('needs-init');
        setInitStep('super-admin');
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
      setInitStep('super-admin');
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
        startStep={initStep as 'super-admin' | 'pricing' | 'create-admin'}
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