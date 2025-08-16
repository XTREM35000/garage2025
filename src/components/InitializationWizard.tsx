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
      WORKFLOW_STEPS.GARAGE_SETUP,
      WORKFLOW_STEPS.COMPLETE
    ];
    
    const currentIndex = stepOrder.indexOf(step);
    const stepNames = [
      'Super Admin',
      'Plan Tarifaire',
      'Création Admin',
      'Organisation',
      'Validation SMS',
      'Configuration Garage'
    ];

    return {
      current: currentIndex + 1,
      total: stepOrder.length,
      stepName: stepNames[currentIndex] || 'Initialisation'
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

  // Gestion de la création du super admin
  const handleSuperAdminCreated = async () => {
    console.log('✅ Super Admin créé, passage au pricing');
    try {
      setIsLoading(true);
      
      // Attendre un peu pour l'effet visuel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Passer à l'étape suivante
      const nextStep = WORKFLOW_STEPS.PRICING;
      setCurrentStep(nextStep);
      
      toast.success('Super Admin créé avec succès ! Passage au choix du plan...');
      
    } catch (error) {
      console.error('❌ Erreur transition super admin:', error);
      toast.error('Erreur lors de la transition');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la sélection du plan
  const handlePlanSelection = async (planId: string) => {
    try {
      console.log('✅ Plan sélectionné:', planId);
      setIsLoading(true);
      
      // Mettre à jour les données de l'organisation
      setOrganizationData(prev => ({ ...prev, selectedPlan: planId }));
      
      // Attendre un peu pour l'effet visuel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Passer à l'étape suivante
      const nextStep = WORKFLOW_STEPS.CREATE_ADMIN;
      setCurrentStep(nextStep);
      
      toast.success('Plan sélectionné ! Création de l\'administrateur...');
      
    } catch (error) {
      console.error('❌ Erreur plan:', error);
      toast.error('Erreur lors de la sélection du plan');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la création de l'admin
  const handleAdminCreated = async () => {
    console.log('✅ Admin créé, passage à l\'organisation');
    try {
      setIsLoading(true);
      
      // Attendre un peu pour l'effet visuel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Passer à l'étape suivante
      const nextStep = WORKFLOW_STEPS.CREATE_ORGANIZATION;
      setCurrentStep(nextStep);
      
      toast.success('Administrateur créé ! Configuration de l\'organisation...');
      
    } catch (error) {
      console.error('❌ Erreur transition admin:', error);
      toast.error('Erreur lors de la transition');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la création de l'organisation
  const handleOrganizationCreated = async () => {
    console.log('✅ Organisation créée, passage à la validation SMS');
    try {
      setIsLoading(true);
      
      // Attendre un peu pour l'effet visuel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Passer à l'étape suivante
      const nextStep = WORKFLOW_STEPS.SMS_VALIDATION;
      setCurrentStep(nextStep);
      
      toast.success('Organisation créée ! Validation par SMS...');
      
    } catch (error) {
      console.error('❌ Erreur transition organisation:', error);
      toast.error('Erreur lors de la transition');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la validation SMS
  const handleSmsValidated = async () => {
    console.log('✅ SMS validé, passage à la configuration du garage');
    try {
      setIsLoading(true);
      
      // Attendre un peu pour l'effet visuel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Passer à l'étape suivante
      const nextStep = WORKFLOW_STEPS.GARAGE_SETUP;
      setCurrentStep(nextStep);
      
      toast.success('SMS validé ! Configuration du garage...');
      
    } catch (error) {
      console.error('❌ Erreur transition SMS:', error);
      toast.error('Erreur lors de la transition');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la configuration du garage
  const handleGarageConfigured = async () => {
    console.log('✅ Garage configuré, finalisation du workflow');
    try {
      setIsLoading(true);
      
      // Attendre un peu pour l'effet visuel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Notifier la completion du workflow
      toast.success('Configuration terminée ! Redirection vers le dashboard...');
      
      // Appeler onComplete pour notifier WorkflowGuard
      onComplete();
      
    } catch (error) {
      console.error('❌ Erreur finalisation garage:', error);
      toast.error('Erreur lors de la finalisation');
    } finally {
      setIsLoading(false);
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
            onComplete={handleSuperAdminCreated}
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
            onSelectPlan={handlePlanSelection}
          />
        );

      case WORKFLOW_STEPS.CREATE_ADMIN:
        console.log('👤 Affichage modal création admin normal');
        return (
          <SuperAdminSetupModal
            isOpen={isOpen}
            onComplete={handleAdminCreated}
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
            onComplete={handleOrganizationCreated}
            selectedPlan={organizationData.selectedPlan}
          />
        );

      case WORKFLOW_STEPS.SMS_VALIDATION:
        console.log('📱 Affichage modal SMS');
        return (
          <SmsValidationModal
            isOpen={isOpen}
            onComplete={handleSmsValidated}
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
            onComplete={handleGarageConfigured}
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
      
      {/* Contenu de l'étape courante avec scroll et responsive */}
      <div className="pt-20 h-screen overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </>
  );
};

export default InitializationWizard;