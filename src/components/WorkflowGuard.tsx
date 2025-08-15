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
  const [hasSuperAdmin, setHasSuperAdmin] = useState<boolean | null>(null);
  const [currentWorkflowData, setCurrentWorkflowData] = useState<any>(null);
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

  // Fonction pour vérifier s'il y a un super admin existant
  const checkSuperAdminExists = async (): Promise<boolean> => {
    try {
      const { count, error } = await supabase
        .from('super_admins')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('❌ Erreur vérification super admin:', error);
        return false;
      }

      const exists = (count || 0) > 0;
      setHasSuperAdmin(exists);
      console.log('👑 Super admin existe:', exists, 'Nombre:', count);
      return exists;
    } catch (error) {
      console.error('❌ Erreur vérification super admin:', error);
      return false;
    }
  };

  // Fonction pour vérifier l'état du workflow en cours
  const checkCurrentWorkflowState = async () => {
    try {
      // Vérifier s'il y a des données de workflow existantes
      const { data: workflowData, error } = await supabase
        .from('onboarding_workflow_states')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erreur récupération workflow:', error);
        return null;
      }

      if (workflowData && workflowData.length > 0) {
        setCurrentWorkflowData(workflowData[0]);
        return workflowData[0];
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur vérification workflow existant:', error);
      return null;
    }
  };

  // Fonction principale de vérification du workflow
  const checkWorkflowState = async () => {
    try {
      setLoading(true);
      console.log('🔍 Vérification du workflow...');

      // 1. Vérifier d'abord s'il y a un super admin existant
      const superAdminExists = await checkSuperAdminExists();

      // 2. Vérifier l'état du workflow en cours
      const currentWorkflow = await checkCurrentWorkflowState();

      // 3. Si pas de super admin, commencer par là
      if (!superAdminExists) {
        console.log('⚠️ Pas de super admin -> Étape SUPER_ADMIN (initialisation)');
        setInitStep(WORKFLOW_STEPS.SUPER_ADMIN);
        setWorkflowState('needs-init');
        setLoading(false);
        return;
      }

      // 4. Si super admin existe, vérifier l'étape suivante
      if (currentWorkflow) {
        console.log('📋 Workflow en cours détecté:', currentWorkflow.current_step);

        // Déterminer l'étape suivante basée sur l'étape actuelle
        let nextStep: ExtendedInitializationStep;

        switch (currentWorkflow.current_step) {
          case WORKFLOW_STEPS.SUPER_ADMIN:
            nextStep = WORKFLOW_STEPS.PRICING;
            break;
          case WORKFLOW_STEPS.PRICING:
            nextStep = WORKFLOW_STEPS.CREATE_ADMIN;
            break;
          case WORKFLOW_STEPS.CREATE_ADMIN:
            // Après création admin, on doit se connecter
            nextStep = WORKFLOW_STEPS.CREATE_ADMIN;
            break;
          case WORKFLOW_STEPS.CREATE_ORGANIZATION:
            nextStep = WORKFLOW_STEPS.SMS_VALIDATION;
            break;
          case WORKFLOW_STEPS.SMS_VALIDATION:
            nextStep = WORKFLOW_STEPS.GARAGE_SETUP;
            break;
          case WORKFLOW_STEPS.GARAGE_SETUP:
            setWorkflowState('completed');
            setLoading(false);
            return;
          default:
            nextStep = WORKFLOW_STEPS.PRICING;
        }

        console.log('🔄 Étape suivante déterminée:', nextStep);
        setInitStep(nextStep);
        setWorkflowState('needs-init');
        setLoading(false);
        return;
      }

      // 5. Si pas de workflow en cours mais super admin existe, commencer par pricing
      console.log('🆕 Super admin existe mais pas de workflow -> PRICING');
      setInitStep(WORKFLOW_STEPS.PRICING);
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

      // Déterminer la prochaine étape
      let nextStep: WorkflowStep;
      let needsAuth = false;

      switch (completedStep) {
        case WORKFLOW_STEPS.SUPER_ADMIN:
          nextStep = WORKFLOW_STEPS.PRICING;
          break;
        case WORKFLOW_STEPS.PRICING:
          nextStep = WORKFLOW_STEPS.CREATE_ADMIN;
          break;
        case WORKFLOW_STEPS.CREATE_ADMIN:
          // Après création admin, on doit se connecter
          needsAuth = true;
          nextStep = WORKFLOW_STEPS.CREATE_ORGANIZATION;
          break;
        case WORKFLOW_STEPS.CREATE_ORGANIZATION:
          nextStep = WORKFLOW_STEPS.SMS_VALIDATION;
          break;
        case WORKFLOW_STEPS.SMS_VALIDATION:
          nextStep = WORKFLOW_STEPS.GARAGE_SETUP;
          break;
        case WORKFLOW_STEPS.GARAGE_SETUP:
          setWorkflowState('completed');
          return;
        default:
          nextStep = 'complete';
      }

      if (needsAuth) {
        console.log('🔐 Authentification requise après création admin');
        setWorkflowState('needs-auth');
        // Rediriger vers login
        navigate('/login');
        return;
      }

      if (nextStep === 'complete') {
        setWorkflowState('completed');
      } else {
        console.log('🔄 Passage à l\'étape suivante:', nextStep);
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
          // Re-vérifier le workflow quand un utilisateur se connecte
          checkWorkflowState();
        } else if (event === 'SIGNED_OUT') {
          setWorkflowState('needs-auth');
          setUserProfile(null);
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