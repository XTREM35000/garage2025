import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import PricingModal from '@/components/PricingModal';
import SuperAdminSetupModal from '@/components/SuperAdminSetupModal';
import OrganizationSetupModal from '@/components/OrganizationSetupModal';
import SmsValidationModal from '@/components/SmsValidationModal';
import GarageSetupModal from '@/components/GarageSetupModal';
import CompletionSummaryModal from '@/components/CompletionSummaryModal';
import { useNavigate } from 'react-router-dom';
import { WorkflowStep, WORKFLOW_STEPS, ExtendedInitializationStep } from '@/types/workflow';
import '../styles/whatsapp-theme.css';

interface InitializationWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  startStep: ExtendedInitializationStep;
  mode?: 'super-admin' | 'normal';
}

interface AdminData {
  email: string;
  password: string;
  phone: string;
  name: string;
  avatarFile?: File | null;
}

interface OrganizationData {
  name: string;
  slug: string;
  code?: string;
  selectedPlan: string;
}

const InitializationWizard: React.FC<InitializationWizardProps> = ({
  isOpen,
  onComplete,
  startStep,
  mode = 'normal'
}) => {
  const [currentStep, setCurrentStep] = useState<ExtendedInitializationStep>(startStep);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminData, setAdminData] = useState<AdminData>({
    email: '',
    password: '',
    phone: '',
    name: '',
    avatarFile: null
  });
  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    name: '',
    slug: '',
    selectedPlan: ''
  });
  const [workflowProgress, setWorkflowProgress] = useState<{
    current: number;
    total: number;
    stepName: string;
  }>({
    current: 1,
    total: 6,
    stepName: 'Initialisation'
  });

  const navigate = useNavigate();


  // Calculer la progression du workflow
  const calculateProgress = (step: ExtendedInitializationStep) => {
    const stepOrder = [
      WORKFLOW_STEPS.SUPER_ADMIN,
      WORKFLOW_STEPS.PRICING,
      WORKFLOW_STEPS.CREATE_ADMIN,
      WORKFLOW_STEPS.CREATE_ORGANIZATION,
      WORKFLOW_STEPS.SMS_VALIDATION,
      WORKFLOW_STEPS.GARAGE_SETUP
    ];
    
    const currentIndex = stepOrder.indexOf(step as any);
    const stepNames = [
      'Super Admin',
      'Plan Tarifaire',
      'Création Admin',
      'Organisation',
      'Validation SMS',
      'Configuration Garage'
    ];

    return {
      current: currentIndex >= 0 ? currentIndex + 1 : stepOrder.length,
      total: stepOrder.length,
      stepName: stepNames[currentIndex] || 'Terminé'
    };
  };

  // Effet pour logger les changements d'étape et mettre à jour la progression
  useEffect(() => {
    console.log('🔄 [InitWizard] Étape courante:', currentStep);
    const progress = calculateProgress(currentStep);
    setWorkflowProgress(progress);
  }, [currentStep]);

  // Utiliser useEffect pour détecter les changements de startStep
  useEffect(() => {
    console.log('🔄 Changement étape:', startStep, 'Mode:', mode);
    // Vérification que startStep est une étape valide
    if (Object.values(WORKFLOW_STEPS).includes(startStep)) {
      setCurrentStep(startStep);
    } else {
      console.error('Étape invalide:', startStep);
    }
  }, [startStep]);

  // Gérer la progression du workflow
  const handleStepComplete = async (stepData?: any) => {
    console.log('🎯 Étape terminée:', currentStep, stepData);

    try {
      switch (currentStep) {
        case WORKFLOW_STEPS.SUPER_ADMIN:
          setCurrentStep(WORKFLOW_STEPS.PRICING);
          break;

        case WORKFLOW_STEPS.PRICING:
          setOrganizationData(prev => ({ ...prev, selectedPlan: stepData }));
          setCurrentStep(WORKFLOW_STEPS.CREATE_ADMIN);
          break;

        case WORKFLOW_STEPS.CREATE_ADMIN:
          console.log('🔐 Admin créé, préparation pour la connexion...');
          setAdminData(stepData);
          
          // Attendre un peu que l'utilisateur soit créé
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Tentative de connexion immédiate avec l'admin créé
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: stepData.email,
              password: stepData.password
            });

            if (error) {
              console.error('❌ Erreur de connexion admin:', error);
              toast.error('Erreur de connexion: ' + error.message);
              return;
            }

            console.log('✅ Connexion admin réussie:', data);
            
            
            setCurrentStep(WORKFLOW_STEPS.CREATE_ORGANIZATION);
          } catch (authError) {
            console.error('❌ Erreur connexion:', authError);
            toast.error('Erreur lors de la connexion');
          }
          break;

        case WORKFLOW_STEPS.CREATE_ORGANIZATION:
          setOrganizationData(stepData);
          setCurrentStep(WORKFLOW_STEPS.SMS_VALIDATION);
          break;

        case WORKFLOW_STEPS.SMS_VALIDATION:
          setCurrentStep(WORKFLOW_STEPS.GARAGE_SETUP);
          break;

        case WORKFLOW_STEPS.GARAGE_SETUP:
          console.log('✅ Workflow terminé!');
          // Terminer le workflow
          onComplete();
          break;

        default:
          console.error('❌ Étape inconnue:', currentStep);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la progression:', error);
      toast.error('Erreur lors de la progression du workflow');
    }
  };

  // Barre de progression du workflow
  const ProgressBar = () => (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#128C7E]/20">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-[#128C7E]">
            Étape {workflowProgress.current} sur {workflowProgress.total}
          </div>
          <div className="text-sm text-gray-600">
            {workflowProgress.stepName}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-[#128C7E] to-[#25D366] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(workflowProgress.current / workflowProgress.total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Rendu conditionnel avec logs explicites
  const renderCurrentStep = () => {
    switch (currentStep) {
      case WORKFLOW_STEPS.SUPER_ADMIN:
        console.log('👑 Affichage modal super admin');
        return (
          <SuperAdminSetupModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            mode="super-admin"
            adminData={adminData}
            onAdminDataChange={(field, value) =>
              setAdminData(prev => ({ ...prev, [field]: value }))
            }
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword(!showPassword)}
            isLoading={isLoading}
            selectedPlan={organizationData.selectedPlan}
          />
        );

      case WORKFLOW_STEPS.PRICING:
        console.log('💰 Affichage modal pricing');
        return (
          <PricingModal
            isOpen={isOpen}
            onSelectPlan={handleStepComplete}
          />
        );

      case WORKFLOW_STEPS.CREATE_ADMIN:
        console.log('👤 Affichage modal création admin normal');
        return (
          <SuperAdminSetupModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            mode="normal"
            adminData={adminData}
            onAdminDataChange={(field, value) =>
              setAdminData(prev => ({ ...prev, [field]: value }))
            }
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword(!showPassword)}
            isLoading={isLoading}
            selectedPlan={organizationData.selectedPlan}
          />
        );

      case WORKFLOW_STEPS.CREATE_ORGANIZATION:
        console.log('🏢 Affichage modal organisation');
        return (
          <OrganizationSetupModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            selectedPlan={organizationData.selectedPlan}
          />
        );

      case WORKFLOW_STEPS.SMS_VALIDATION:
        console.log('📱 Affichage modal SMS');
        return (
          <SmsValidationModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            organizationName={organizationData.name}
            organizationCode={organizationData.slug}
            adminName={adminData.name}
          />
        );

      case WORKFLOW_STEPS.GARAGE_SETUP:
        console.log('🔧 Affichage modal garage');
        return (
          <GarageSetupModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            organizationName={organizationData.name}
          />
        );

      default:
        console.error('❌ Étape inconnue:', currentStep);
        return (
          <div className="text-center py-8">
            <div className="text-red-500 text-lg">Étape inconnue</div>
            <button 
              onClick={() => setCurrentStep(WORKFLOW_STEPS.SUPER_ADMIN)}
              className="btn-whatsapp-primary mt-4"
            >
              Recommencer
            </button>
          </div>
        );
    }
  };

  return (
    <>
      {/* Barre de progression */}
      <ProgressBar />
      
      {/* Contenu de l'étape courante */}
      <div className="pt-20">
        {renderCurrentStep()}
      </div>
    </>
  );
};

export default InitializationWizard;