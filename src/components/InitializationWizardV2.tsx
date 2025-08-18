import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { useAuthSession } from '@/hooks/useAuthSession';
import { WORKFLOW_STEPS, WorkflowStep, WorkflowStateData } from '@/types/workflow';
import { logWorkflowInfo, logWorkflowError, logWorkflowTransition } from '@/utils/workflowLogger';
import { handleWorkflowError } from '@/utils/errorHandlers';
import { toast } from 'sonner';
import PricingModal from '@/components/PricingModal';
import SuperAdminSetupModal from '@/components/SuperAdminSetupModal';
import OrganizationSetupModal from '@/components/OrganizationSetupModal';
import SmsValidationModal from '@/components/SmsValidationModal';
import GarageSetupModal from '@/components/GarageSetupModal';
import StepGuard from '@/components/StepGuard';
import WorkflowManager from '@/components/WorkflowManager';
import '../styles/whatsapp-theme.css';

interface InitializationWizardV2Props {
  currentStep: WorkflowStep;
  workflowState: WorkflowStateData;
  onStepComplete: (step: WorkflowStep) => Promise<void>;
  onWorkflowComplete: () => void;
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

const InitializationWizardV2: React.FC<InitializationWizardV2Props> = ({
  currentStep,
  workflowState,
  onStepComplete,
  onWorkflowComplete
}) => {
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const { updateStep, completeStep } = useWorkflow();
  
  const [isLoading, setIsLoading] = useState(false);
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

  // Logger le début de l'étape
  useEffect(() => {
    logWorkflowInfo(`Début de l'étape: ${currentStep}`, currentStep, {
      stepStartTime: Date.now(),
      workflowState: workflowState
    });
  }, [currentStep, workflowState]);

  // Fonction pour passer à l'étape suivante
  const advanceToNextStep = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      
      const stepOrder = [
        WORKFLOW_STEPS.SUPER_ADMIN,
        WORKFLOW_STEPS.PRICING,
        WORKFLOW_STEPS.CREATE_ADMIN,
        WORKFLOW_STEPS.CREATE_ORGANIZATION,
        WORKFLOW_STEPS.SMS_VALIDATION,
        WORKFLOW_STEPS.GARAGE_SETUP,
        WORKFLOW_STEPS.COMPLETE
      ];

      const currentIndex = stepOrder.indexOf(currentStep);
      const nextStep = stepOrder[currentIndex + 1];

      if (!nextStep) {
        logWorkflowInfo('Workflow terminé, toutes les étapes complétées');
        onWorkflowComplete();
        return;
      }

      logWorkflowInfo(`Passage à l'étape suivante: ${nextStep}`, currentStep, {
        from: currentStep,
        to: nextStep
      });

      // Mettre à jour l'étape dans le backend
      await updateStep(nextStep);
      
      // Logger la transition
      logWorkflowTransition({
        from: currentStep,
        to: nextStep,
        timestamp: new Date(),
        success: true
      }, user?.id);

      // Notifier la completion de l'étape
      await onStepComplete(currentStep);
      
      toast.success(`Étape ${currentStep} terminée avec succès`);
      
    } catch (error) {
      logWorkflowError(`Erreur lors du passage à l'étape suivante`, currentStep, error);
      handleWorkflowError(error, currentStep, {
        showToast: true,
        retryCount: 2
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, isLoading, updateStep, onStepComplete, onWorkflowComplete, user?.id]);

  // Gestion de la completion de l'étape Super Admin
  const handleSuperAdminComplete = async (adminData: AdminData): Promise<void> => {
    try {
      setIsLoading(true);
      
      logWorkflowInfo('Super Admin créé avec succès', WORKFLOW_STEPS.SUPER_ADMIN, {
        adminEmail: adminData.email,
        adminName: adminData.name
      });

      // Mettre à jour l'état du workflow avec l'ID de l'admin
      // Note: L'ID sera récupéré depuis la réponse de création
      await updateStep(WORKFLOW_STEPS.SUPER_ADMIN, {
        admin_id: user?.id // Temporaire, à remplacer par l'ID réel
      });

      // Marquer l'étape comme complétée
      await completeStep(WORKFLOW_STEPS.SUPER_ADMIN);
      
      // Passer à l'étape suivante
      await advanceToNextStep();
      
    } catch (error) {
      logWorkflowError('Erreur lors de la création du Super Admin', WORKFLOW_STEPS.SUPER_ADMIN, error);
      handleWorkflowError(error, WORKFLOW_STEPS.SUPER_ADMIN);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la completion de l'étape Pricing
  const handlePricingComplete = async (selectedPlan: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      logWorkflowInfo('Plan tarifaire sélectionné', WORKFLOW_STEPS.PRICING, {
        selectedPlan
      });

      // Marquer l'étape comme complétée
      await completeStep(WORKFLOW_STEPS.PRICING);
      
      // Passer à l'étape suivante
      await advanceToNextStep();
      
    } catch (error) {
      logWorkflowError('Erreur lors de la sélection du plan', WORKFLOW_STEPS.PRICING, error);
      handleWorkflowError(error, WORKFLOW_STEPS.PRICING);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la completion de l'étape Create Admin
  const handleCreateAdminComplete = async (adminData: AdminData): Promise<void> => {
    try {
      setIsLoading(true);
      
      logWorkflowInfo('Admin créé avec succès', WORKFLOW_STEPS.CREATE_ADMIN, {
        adminEmail: adminData.email,
        adminName: adminData.name
      });

      // Mettre à jour l'état du workflow avec l'ID de l'admin
      await updateStep(WORKFLOW_STEPS.CREATE_ADMIN, {
        admin_id: user?.id // Temporaire, à remplacer par l'ID réel
      });

      // Marquer l'étape comme complétée
      await completeStep(WORKFLOW_STEPS.CREATE_ADMIN);
      
      // Passer à l'étape suivante
      await advanceToNextStep();
      
    } catch (error) {
      logWorkflowError('Erreur lors de la création de l\'admin', WORKFLOW_STEPS.CREATE_ADMIN, error);
      handleWorkflowError(error, WORKFLOW_STEPS.CREATE_ADMIN);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la completion de l'étape Create Organization
  const handleCreateOrganizationComplete = async (orgData: OrganizationData): Promise<void> => {
    try {
      setIsLoading(true);
      
      logWorkflowInfo('Organisation créée avec succès', WORKFLOW_STEPS.CREATE_ORGANIZATION, {
        orgName: orgData.name,
        orgSlug: orgData.slug,
        plan: orgData.selectedPlan
      });

      // Mettre à jour l'état du workflow avec l'ID de l'organisation
      // Note: L'ID sera récupéré depuis la réponse de création
      await updateStep(WORKFLOW_STEPS.CREATE_ORGANIZATION, {
        org_id: 'temp-org-id' // Temporaire, à remplacer par l'ID réel
      });

      // Marquer l'étape comme complétée
      await completeStep(WORKFLOW_STEPS.CREATE_ORGANIZATION);
      
      // Passer à l'étape suivante
      await advanceToNextStep();
      
    } catch (error) {
      logWorkflowError('Erreur lors de la création de l\'organisation', WORKFLOW_STEPS.CREATE_ORGANIZATION, error);
      handleWorkflowError(error, WORKFLOW_STEPS.CREATE_ORGANIZATION);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la completion de l'étape SMS Validation
  const handleSmsValidationComplete = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      logWorkflowInfo('Validation SMS réussie', WORKFLOW_STEPS.SMS_VALIDATION);

      // Marquer l'étape comme complétée
      await completeStep(WORKFLOW_STEPS.SMS_VALIDATION);
      
      // Passer à l'étape suivante
      await advanceToNextStep();
      
    } catch (error) {
      logWorkflowError('Erreur lors de la validation SMS', WORKFLOW_STEPS.SMS_VALIDATION, error);
      handleWorkflowError(error, WORKFLOW_STEPS.SMS_VALIDATION);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la completion de l'étape Garage Setup
  const handleGarageSetupComplete = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      logWorkflowInfo('Configuration garage terminée', WORKFLOW_STEPS.GARAGE_SETUP);

      // Marquer l'étape comme complétée
      await completeStep(WORKFLOW_STEPS.GARAGE_SETUP);
      
      // Marquer le workflow comme terminé
      await updateStep(WORKFLOW_STEPS.COMPLETE, {
        is_completed: true
      });

      logWorkflowInfo('Workflow d\'initialisation terminé avec succès', WORKFLOW_STEPS.COMPLETE);
      
      // Notifier la completion du workflow
      onWorkflowComplete();
      
    } catch (error) {
      logWorkflowError('Erreur lors de la configuration du garage', WORKFLOW_STEPS.GARAGE_SETUP, error);
      handleWorkflowError(error, WORKFLOW_STEPS.GARAGE_SETUP);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Rendu de l'étape courante
  const renderCurrentStep = (): React.ReactNode => {
    switch (currentStep) {
      case WORKFLOW_STEPS.SUPER_ADMIN:
        return (
          <StepGuard requiredStep={WORKFLOW_STEPS.SUPER_ADMIN}>
            <SuperAdminSetupModal
              isOpen={true}
              onComplete={handleSuperAdminComplete}
              mode="super-admin"
              adminData={adminData}
              onAdminDataChange={(field, value) => 
                setAdminData(prev => ({ ...prev, [field]: value }))
              }
              showPassword={false}
              onToggleShowPassword={() => {}}
              isLoading={isLoading}
            />
          </StepGuard>
        );

      case WORKFLOW_STEPS.PRICING:
        return (
          <StepGuard requiredStep={WORKFLOW_STEPS.PRICING}>
            <PricingModal
              isOpen={true}
              onSelectPlan={handlePricingComplete}
              isLoading={isLoading}
            />
          </StepGuard>
        );

      case WORKFLOW_STEPS.CREATE_ADMIN:
        return (
          <StepGuard requiredStep={WORKFLOW_STEPS.CREATE_ADMIN}>
            <SuperAdminSetupModal
              isOpen={true}
              onComplete={handleCreateAdminComplete}
              mode="admin"
              adminData={adminData}
              onAdminDataChange={(field, value) => 
                setAdminData(prev => ({ ...prev, [field]: value }))
              }
              showPassword={false}
              onToggleShowPassword={() => {}}
              isLoading={isLoading}
            />
          </StepGuard>
        );

      case WORKFLOW_STEPS.CREATE_ORGANIZATION:
        return (
          <StepGuard requiredStep={WORKFLOW_STEPS.CREATE_ORGANIZATION}>
            <OrganizationSetupModal
              isOpen={true}
              onComplete={handleCreateOrganizationComplete}
              isLoading={isLoading}
            />
          </StepGuard>
        );

      case WORKFLOW_STEPS.SMS_VALIDATION:
        return (
          <StepGuard requiredStep={WORKFLOW_STEPS.SMS_VALIDATION}>
            <SmsValidationModal
              isOpen={true}
              onComplete={handleSmsValidationComplete}
              isLoading={isLoading}
            />
          </StepGuard>
        );

      case WORKFLOW_STEPS.GARAGE_SETUP:
        return (
          <StepGuard requiredStep={WORKFLOW_STEPS.GARAGE_SETUP}>
            <GarageSetupModal
              isOpen={true}
              onComplete={handleGarageSetupComplete}
              isLoading={isLoading}
            />
          </StepGuard>
        );

      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Étape non reconnue
            </h2>
            <p className="text-gray-600">
              L'étape "{currentStep}" n'est pas configurée.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="initialization-wizard-v2">
      <WorkflowManager
        autoAdvance={false}
        showProgress={true}
        onStepChange={(step) => {
          logWorkflowInfo(`Changement d'étape détecté: ${step}`, step);
        }}
      >
        <div className="wizard-content">
          {renderCurrentStep()}
        </div>
      </WorkflowManager>
    </div>
  );
};

export default InitializationWizardV2;
