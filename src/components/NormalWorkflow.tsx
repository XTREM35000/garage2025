import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { logWorkflowInfo, logWorkflowError } from '@/utils/workflowLogger';
import { WORKFLOW_STEPS, WorkflowStep } from '@/types/workflow';
import PricingModal from './PricingModal';
import SuperAdminSetupModal from './SuperAdminSetupModal';
import OrganizationSetupModal from './OrganizationSetupModal';
import SmsValidationModal from './SmsValidationModal';
import GarageSetupModal from './GarageSetupModal';
import CompletionSummaryModal from './CompletionSummaryModal';
import { Loader2, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

interface NormalWorkflowProps {
  children: React.ReactNode;
}

interface WorkflowStepInfo {
  name: string;
  key: WorkflowStep;
  check: () => Promise<boolean>;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

const NormalWorkflow: React.FC<NormalWorkflowProps> = ({ children }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workflowState, setWorkflowState] = useState<any>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Définition des étapes du workflow avec leurs vérifications
  const workflowSteps: WorkflowStepInfo[] = [
    {
      name: 'Plan Tarifaire',
      key: WORKFLOW_STEPS.PRICING,
      check: async () => {
        try {
          const { data, error } = await supabase
            .from('pricing_plans')
            .select('*')
            .limit(1);
          
          if (error) throw error;
          return !data || data.length === 0;
        } catch (error) {
          logWorkflowError('Erreur vérification plan tarifaire', WORKFLOW_STEPS.PRICING, error);
          return true; // Considérer comme nécessaire en cas d'erreur
        }
      },
      component: PricingModal,
      props: {
        isOpen: true,
        onSelectPlan: handlePricingComplete,
        isLoading: false
      }
    },
    {
      name: 'Administrateur',
      key: WORKFLOW_STEPS.CREATE_ADMIN,
      check: async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'admin')
            .limit(1);
          
          if (error) throw error;
          return !data || data.length === 0;
        } catch (error) {
          logWorkflowError('Erreur vérification admin', WORKFLOW_STEPS.CREATE_ADMIN, error);
          return true;
        }
      },
      component: SuperAdminSetupModal,
      props: {
        isOpen: true,
        onComplete: handleAdminComplete,
        mode: 'admin',
        adminData: {
          email: '',
          password: '',
          phone: '',
          name: '',
          avatarFile: null
        },
        onAdminDataChange: () => {},
        showPassword: false,
        onToggleShowPassword: () => {},
        isLoading: false
      }
    },
    {
      name: 'Organisation',
      key: WORKFLOW_STEPS.CREATE_ORGANIZATION,
      check: async () => {
        try {
          const { data, error } = await supabase
            .from('organisations')
            .select('*')
            .limit(1);
          
          if (error) throw error;
          return !data || data.length === 0;
        } catch (error) {
          logWorkflowError('Erreur vérification organisation', WORKFLOW_STEPS.CREATE_ORGANIZATION, error);
          return true;
        }
      },
      component: OrganizationSetupModal,
      props: {
        isOpen: true,
        onComplete: handleOrganizationComplete,
        isLoading: false
      }
    },
    {
      name: 'Validation SMS',
      key: WORKFLOW_STEPS.SMS_VALIDATION,
      check: async () => {
        try {
          const { data, error } = await supabase
            .from('sms_validations')
            .select('*')
            .eq('is_validated', true)
            .limit(1);
          
          if (error) throw error;
          return !data || data.length === 0;
        } catch (error) {
          logWorkflowError('Erreur vérification SMS', WORKFLOW_STEPS.SMS_VALIDATION, error);
          return true;
        }
      },
      component: SmsValidationModal,
      props: {
        isOpen: true,
        onComplete: handleSmsComplete,
        isLoading: false
      }
    },
    {
      name: 'Configuration Garage',
      key: WORKFLOW_STEPS.GARAGE_SETUP,
      check: async () => {
        try {
          const { data, error } = await supabase
            .from('garage_settings')
            .select('*')
            .limit(1);
          
          if (error) throw error;
          return !data || data.length === 0;
        } catch (error) {
          logWorkflowError('Erreur vérification garage', WORKFLOW_STEPS.GARAGE_SETUP, error);
          return true;
        }
      },
      component: GarageSetupModal,
      props: {
        isOpen: true,
        onComplete: handleGarageComplete,
        isLoading: false
      }
    }
  ];

  // Vérifier l'état du workflow au chargement
  useEffect(() => {
    const checkWorkflowState = async () => {
      try {
        setIsLoading(true);
        logWorkflowInfo('Vérification de l\'état du workflow...');

        // Vérifier chaque étape dans l'ordre
        for (const step of workflowSteps) {
          const needsCompletion = await step.check();
          if (needsCompletion) {
            setCurrentStep(step.key);
            logWorkflowInfo(`Étape requise: ${step.name}`, step.key);
            break;
          }
        }

        // Si aucune étape n'est requise, le workflow est terminé
        if (!currentStep) {
          logWorkflowInfo('Workflow terminé, toutes les étapes sont complètes');
          setShowCompletionModal(true);
        }

      } catch (error) {
        logWorkflowError('Erreur lors de la vérification du workflow', undefined, error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWorkflowState();
  }, []);

  // Handlers pour la completion des étapes
  const handlePricingComplete = async (selectedPlan: string) => {
    try {
      logWorkflowInfo('Plan tarifaire sélectionné', WORKFLOW_STEPS.PRICING, { selectedPlan });
      
      // Sauvegarder le plan sélectionné
      const { error } = await supabase
        .from('pricing_plans')
        .insert({ plan_name: selectedPlan, is_active: true });
      
      if (error) throw error;
      
      // Passer à l'étape suivante
      await advanceToNextStep();
      
    } catch (error) {
      logWorkflowError('Erreur lors de la sélection du plan', WORKFLOW_STEPS.PRICING, error);
    }
  };

  const handleAdminComplete = async (adminData: any) => {
    try {
      logWorkflowInfo('Admin créé avec succès', WORKFLOW_STEPS.CREATE_ADMIN, adminData);
      await advanceToNextStep();
    } catch (error) {
      logWorkflowError('Erreur lors de la création de l\'admin', WORKFLOW_STEPS.CREATE_ADMIN, error);
    }
  };

  const handleOrganizationComplete = async (orgData: any) => {
    try {
      logWorkflowInfo('Organisation créée avec succès', WORKFLOW_STEPS.CREATE_ORGANIZATION, orgData);
      await advanceToNextStep();
    } catch (error) {
      logWorkflowError('Erreur lors de la création de l\'organisation', WORKFLOW_STEPS.CREATE_ORGANIZATION, error);
    }
  };

  const handleSmsComplete = async () => {
    try {
      logWorkflowInfo('Validation SMS réussie', WORKFLOW_STEPS.SMS_VALIDATION);
      await advanceToNextStep();
    } catch (error) {
      logWorkflowError('Erreur lors de la validation SMS', WORKFLOW_STEPS.SMS_VALIDATION, error);
    }
  };

  const handleGarageComplete = async () => {
    try {
      logWorkflowInfo('Configuration garage terminée', WORKFLOW_STEPS.GARAGE_SETUP);
      setShowCompletionModal(true);
    } catch (error) {
      logWorkflowError('Erreur lors de la configuration du garage', WORKFLOW_STEPS.GARAGE_SETUP, error);
    }
  };

  // Fonction pour passer à l'étape suivante
  const advanceToNextStep = async () => {
    try {
      const currentIndex = workflowSteps.findIndex(step => step.key === currentStep);
      const nextStep = workflowSteps[currentIndex + 1];
      
      if (nextStep) {
        setCurrentStep(nextStep.key);
        logWorkflowInfo(`Passage à l'étape: ${nextStep.name}`, nextStep.key);
      } else {
        // Dernière étape terminée
        setCurrentStep(null);
        setShowCompletionModal(true);
      }
    } catch (error) {
      logWorkflowError('Erreur lors du passage à l\'étape suivante', currentStep, error);
    }
  };

  // Gestion de la fermeture du modal de completion
  const handleCompletionClose = () => {
    setShowCompletionModal(false);
    navigate('/dashboard');
  };

  // Affichage du loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-800">
              Vérification du workflow
            </h2>
            <p className="text-slate-600">
              Analyse des étapes à compléter...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Workflow terminé - afficher le contenu principal
  if (!currentStep) {
    return (
      <>
        {children}
        <CompletionSummaryModal
          isOpen={showCompletionModal}
          onClose={handleCompletionClose}
        />
      </>
    );
  }

  // Afficher l'étape courante
  const currentStepInfo = workflowSteps.find(step => step.key === currentStep);
  
  if (!currentStepInfo) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-semibold text-red-800">
            Étape non reconnue
          </h2>
          <p className="text-red-600">
            L'étape "{currentStep}" n'est pas configurée.
          </p>
        </div>
      </div>
    );
  }

  // Rendu de l'étape courante
  const StepComponent = currentStepInfo.component;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header du workflow */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Configuration du système
                </h1>
                <p className="text-sm text-gray-500">
                  Étape {workflowSteps.findIndex(step => step.key === currentStep) + 1} sur {workflowSteps.length}
                </p>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="flex items-center space-x-2">
              {workflowSteps.map((step, index) => {
                const isCompleted = workflowSteps.findIndex(s => s.key === currentStep) > index;
                const isCurrent = step.key === currentStep;
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <ArrowRight className={`w-4 h-4 mx-2 ${
                        isCompleted ? 'text-green-500' : 'text-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu de l'étape */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepInfo.name}
            </h2>
            <p className="text-gray-600">
              Veuillez compléter cette étape pour continuer la configuration.
            </p>
          </div>
          
          <StepComponent {...currentStepInfo.props} />
        </div>
      </div>
    </div>
  );
};

export default NormalWorkflow;
