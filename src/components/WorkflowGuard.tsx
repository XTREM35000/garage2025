import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SplashScreen from './SplashScreen';
import InitializationWizard from './InitializationWizard';

interface WorkflowGuardProps {
  children: React.ReactNode;
}

type WorkflowState = 'loading' | 'needs-init' | 'needs-auth' | 'ready' | 'completed';
type InitStep = 'super-admin' | 'pricing' | 'create-admin' | 'create-organization' | 'sms-validation' | 'garage-setup';
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
    try {
      console.log('🔍 WorkflowGuard: Début vérification workflow...');

      // 1. Vérification Super Admin (PRIORITAIRE)
      const { count, error: countError } = await supabase
        .from('super_admins')
        .select('*', { count: 'exact' });

      if (countError) {
        console.error('❌ Erreur lors de la vérification super_admins:', countError);
        throw countError;
      }

      // Si pas de super admin, on force l'affichage du formulaire
      if (count === 0) {
        console.log('❌ Aucun Super Admin - Affichage forcé du formulaire super-admin');
        setWorkflowState('needs-init');
        setInitStep('super-admin');
        setLoading(false);
        return; // STOP ici - pas de vérification auth
      }

      // 2. Le reste des vérifications seulement si un super admin existe
      console.log('✅ Super Admin existe, vérification auth...');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('❌ Pas d\'utilisateur connecté');
        setWorkflowState('needs-auth');
        setLoading(false);
        return;
      }
      console.log('✅ Utilisateur connecté:', user.email);

      // 2. Vérification du profil admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        console.log('❌ Pas de profil admin, démarrage pricing');
        setWorkflowState('needs-init');
        setInitStep('pricing');
        setLoading(false);
        return;
      }
      console.log('✅ Profil admin trouvé');

      // 3. Vérification de l'organisation
      const { data: orgData, error: orgError } = await supabase
        .from('user_organizations')
        .select('organisation_id')
        .eq('user_id', user.id)
        .single();

      if (orgError || !orgData) {
        console.log('❌ Pas d\'organisation, démarrage create-organization');
        setWorkflowState('needs-init');
        setInitStep('create-organization');
        setLoading(false);
        return;
      }
      console.log('✅ Organisation trouvée');

      // 4. Vérification de la validation SMS
      const { data: smsData, error: smsError } = await supabase
        .from('sms_validations')
        .select('is_validated')
        .eq('user_id', user.id)
        .single();

      if (smsError || !smsData || !smsData.is_validated) {
        console.log('❌ SMS non validé, démarrage sms-validation');
        setWorkflowState('needs-init');
        setInitStep('sms-validation');
        setLoading(false);
        return;
      }
      console.log('✅ SMS validé');

      // 5. Vérification du garage setup
      const { data: garageData, error: garageError } = await supabase
        .from('garages')
        .select('is_configured')
        .eq('organisation_id', orgData.organisation_id)
        .single();

      if (garageError || !garageData || !garageData.is_configured) {
        console.log('❌ Garage non configuré, démarrage garage-setup');
        setWorkflowState('needs-init');
        setInitStep('garage-setup');
        setLoading(false);
        return;
      }
      console.log('✅ Garage configuré');

      // 6. Tout est OK, workflow complet
      console.log('✅ Workflow complet, accès au dashboard');
      setWorkflowState('completed');
      setLoading(false);

    } catch (error) {
      console.error('❌ Erreur générale:', error);
      // En cas d'erreur sur la vérification super_admin, on force aussi le formulaire
      setWorkflowState('needs-init');
      setInitStep('super-admin');
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

    // Si on vient de créer un super admin, redirection vers auth
    if (initStep === 'super-admin') {
      setWorkflowState('needs-auth');
      return;
    }

    // Marquer comme prêt et laisser le guard faire une nouvelle vérification
    setWorkflowState('ready');

    // Délai pour permettre au système de traiter les données
    setTimeout(() => {
      checkWorkflowState(); // Re-vérifier l'état après completion
    }, 1000);
  };

  // État de chargement
  if (loading) {
    return <SplashScreen onComplete={() => {
      setLoading(false);
      // Ne pas rappeler checkWorkflowState ici
    }} />;
  }

  // Log pour debug
  console.log('[WorkflowGuard Render] État actuel:', { workflowState, initStep, loading });

  // Rendu strict basé sur l'état
  if (workflowState === 'needs-auth' && initStep !== 'super-admin') {
    window.location.href = '/auth';
    return null;
  }

  if (workflowState === 'needs-init') {
    console.log('[WorkflowGuard] Affichage InitializationWizard avec step:', initStep);
    return (
      <InitializationWizard
        isOpen={true}
        onComplete={handleInitComplete}
        startStep={initStep as 'pricing' | 'create-admin' | 'super-admin'}
        mode={initStep === 'super-admin' ? 'super-admin' : 'normal'}
      />
    );
  }

  if (workflowState === 'completed' || workflowState === 'ready') {
    return <>{children}</>;
  }

  return null;
};

export default WorkflowGuard;