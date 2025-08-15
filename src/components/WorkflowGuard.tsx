import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SplashScreen from './SplashScreen';
import InitializationWizard from './InitializationWizard';
import CompletionSummaryModal from './CompletionSummaryModal';
import {
  WorkflowState,
  ExtendedInitializationStep,
  WorkflowStep,
  WORKFLOW_STEPS
} from '@/types/workflow';

interface WorkflowGuardProps {
  children: React.ReactNode;
}

// Séquence du workflow d'initialisation
const WORKFLOW_SEQUENCE: readonly ExtendedInitializationStep[] = [
  WORKFLOW_STEPS.SUPER_ADMIN,
  WORKFLOW_STEPS.PRICING,
  WORKFLOW_STEPS.CREATE_ADMIN,
  WORKFLOW_STEPS.CREATE_ORGANIZATION,
  WORKFLOW_STEPS.SMS_VALIDATION,
  WORKFLOW_STEPS.GARAGE_SETUP
] as const;

// Types pour le profil utilisateur
interface UserProfile {
  id: string;
  role: string;
  status?: string;
  email: string;
  nom: string;
}

// Types pour l'organisation
interface UserOrganization {
  id: string;
  organisation_id: string;
  role: string;
  status: string;
}

const WorkflowGuard: React.FC<WorkflowGuardProps> = ({ children }) => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>('loading');
  const [initStep, setInitStep] = useState<ExtendedInitializationStep>('super-admin');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userOrganization, setUserOrganization] = useState<UserOrganization | null>(null);
  const navigate = useNavigate();

  // Fonction pour mettre à jour l'étape du workflow
  const updateWorkflowStep = async (userId: string, step: WorkflowStep, organisationId?: string) => {
    try {
      console.log('📝 Mise à jour workflow:', { userId, step, organisationId });

      // Vérifier si un enregistrement existe déjà
      const { data: existing } = await supabase
        .from('onboarding_workflow_states')
        .select('id')
        .eq('user_id', userId)
        .single();

      const payload = {
        user_id: userId,
        current_step: step,
        organisation_id: organisationId,
        updated_at: new Date().toISOString()
      };

      let error;
      if (existing) {
        // Update
        const { error: updateError } = await supabase
          .from('onboarding_workflow_states')
          .update(payload)
          .eq('user_id', userId);
        error = updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('onboarding_workflow_states')
          .insert([payload]);
        error = insertError;
      }

      if (error) {
        console.error('❌ Erreur SQL:', error);
        throw error;
      }

      console.log('✅ Workflow mis à jour:', step);
      return true;
    } catch (error) {
      console.error('❌ Erreur mise à jour workflow:', error);
      throw error;
    }
  };

  // Fonction pour vérifier le profil et l'organisation de l'utilisateur
  const checkUserAccess = async (userId: string) => {
    try {
      // 1. Récupérer le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, email, nom')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Erreur récupération profil:', profileError);
        return null;
      }

      setUserProfile(profile);

      // 2. Récupérer l'organisation de l'utilisateur
      const { data: orgData, error: orgError } = await supabase
        .from('user_organizations')
        .select(`
          id,
          organisation_id,
          role,
          status
        `)
        .eq('user_id', userId)
        .single();

      if (orgError && orgError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Erreur récupération organisation:', orgError);
      }

      if (orgData) {
        setUserOrganization(orgData);
      }

      return { profile, organization: orgData };
    } catch (error) {
      console.error('❌ Erreur vérification accès utilisateur:', error);
      return null;
    }
  };

  // Fonction principale de vérification du workflow
  const checkWorkflowState = async () => {
    try {
      setLoading(true);
      console.log('🔍 Vérification du workflow...');

      // 1. Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('⚠️ Aucun utilisateur connecté');
        setWorkflowState('needs-auth');
        setLoading(false);
        return;
      }

      // 2. Vérifier le profil et l'organisation de l'utilisateur
      const userAccess = await checkUserAccess(user.id);

      // 3. Si l'utilisateur a un profil avec le rôle "admin" et le status "tenant"
      if (userAccess?.profile?.role === 'admin' && userAccess?.organization?.status === 'tenant') {
        console.log('✅ Utilisateur Admin/Tenant détecté -> Accès au dashboard');
        setWorkflowState('ready');
        setLoading(false);
        return;
      }

      // 4. Vérifier si un super admin existe
      const { count: superAdminCount } = await supabase
        .from('super_admins')
        .select('*', { count: 'exact' });

      console.log('👑 Nombre de super admins:', superAdminCount);

      // 5. Si pas de super admin, commencer par là
      if (superAdminCount === 0) {
        console.log('⚠️ Pas de super admin -> Étape SUPER_ADMIN');
        setInitStep(WORKFLOW_STEPS.SUPER_ADMIN);
        setWorkflowState('needs-init');
        setLoading(false);
        return;
      }

      // 6. Vérifier l'état du workflow pour cet utilisateur
      const { data: workflowData } = await supabase
        .from('onboarding_workflow_states')
        .select('current_step, organisation_id')
        .eq('user_id', user.id)
        .single();

      let nextStep: ExtendedInitializationStep;

      // 7. Déterminer l'étape suivante
      if (!workflowData) {
        // Nouveau workflow -> commencer par PRICING
        console.log('🆕 Nouveau workflow -> PRICING');
        nextStep = WORKFLOW_STEPS.PRICING;
      } else if (workflowData.current_step === WORKFLOW_STEPS.PRICING) {
        // Après pricing -> CREATE_ADMIN
        console.log('💰 Plan choisi -> CREATE_ADMIN');
        nextStep = WORKFLOW_STEPS.CREATE_ADMIN;
      } else {
        // Garder l'étape en cours
        nextStep = workflowData.current_step as ExtendedInitializationStep;
      }

      console.log('✅ Étape déterminée:', nextStep);
      setInitStep(nextStep);
      setWorkflowState('needs-init');

    } catch (error) {
      console.error('❌ Erreur workflow:', error);
      toast.error('Erreur de vérification du workflow');
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la progression du workflow
  const handleInitComplete = async (completedStep: WorkflowStep) => {
    try {
      console.log('🎯 Étape terminée:', completedStep);

      if (completedStep === WORKFLOW_STEPS.GARAGE_SETUP) {
        // Après setup garage, on passe à complete
        setWorkflowState('completed');
        return;
      }

      // Force la progression après pricing vers CREATE_ADMIN
      if (completedStep === WORKFLOW_STEPS.PRICING) {
        console.log('🔄 Force progression vers CREATE_ADMIN');
        const nextStep = WORKFLOW_STEPS.CREATE_ADMIN;

        // Tenter de mettre à jour en base si possible
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await updateWorkflowStep(user.id, nextStep);
          }
        } catch (error) {
          console.warn('⚠️ Pas d\'utilisateur, continue quand même');
        }

        // Force l'étape suivante même sans user
        setInitStep(nextStep);
        setWorkflowState('needs-init');
        return;
      }

      // Pour les autres étapes, on garde la vérification utilisateur
      const { data: { user } } = await supabase.auth.getUser();

      // Déterminer la prochaine étape
      const currentIndex = WORKFLOW_SEQUENCE.indexOf(completedStep as ExtendedInitializationStep);
      let nextStep: WorkflowStep = 'complete';

      if (currentIndex < WORKFLOW_SEQUENCE.length - 1) {
        nextStep = WORKFLOW_SEQUENCE[currentIndex + 1];
      }

      // Mise à jour si possible
      if (user) {
        await updateWorkflowStep(user.id, nextStep);
      }

      if (nextStep === 'complete') {
        setWorkflowState('completed');
      } else {
        setInitStep(nextStep as ExtendedInitializationStep);
        setWorkflowState('needs-init');
      }

    } catch (error) {
      console.error('❌ Erreur progression:', error);
    }
  };

  // Écouter les changements de session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 État auth:', event, session?.user?.email);

        if (event === 'SIGNED_IN') {
          checkWorkflowState();
        } else if (event === 'SIGNED_OUT') {
          setWorkflowState('needs-auth');
          setUserProfile(null);
          setUserOrganization(null);
          navigate('/login');
        }
      }
    );

    // Vérification initiale
    checkWorkflowState();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Rendu conditionnel
  if (loading) {
    return <SplashScreen onComplete={() => setLoading(false)} />;
  }

  // État d'authentification requis
  if (workflowState === 'needs-auth') {
    return <SplashScreen onComplete={() => checkWorkflowState()} />;
  }

  // État d'initialisation requise
  if (workflowState === 'needs-init') {
    return (
      <InitializationWizard
        isOpen={true}
        onComplete={() => handleInitComplete(initStep)}
        startStep={initStep}
        mode={initStep === WORKFLOW_STEPS.SUPER_ADMIN ? 'super-admin' : 'normal'}
      />
    );
  }

  // État d'initialisation terminée
  if (workflowState === 'completed') {
    return (
      <CompletionSummaryModal
        isOpen={true}
        onClose={() => {
          setWorkflowState('ready');
          navigate('/dashboard');
        }}
      />
    );
  }

  // État prêt - afficher le contenu principal
  if (workflowState === 'ready') {
    // Si l'utilisateur est Admin/Tenant, afficher le dashboard
    if (userProfile?.role === 'admin' && userOrganization?.status === 'tenant') {
      console.log('🎯 Affichage du dashboard Admin/Tenant');
      return children;
    }
    
    // Sinon, continuer avec l'initialisation
    console.log('🔄 Redémarrage de l\'initialisation');
    setWorkflowState('needs-init');
    return null;
  }

  // État par défaut
  return <SplashScreen onComplete={() => checkWorkflowState()} />;
};

export default WorkflowGuard;