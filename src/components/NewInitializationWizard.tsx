import React from 'react';
import { useWorkflow } from '@/contexts/WorkflowProvider';
import { useAuthWorkflow } from '@/hooks/useAuthWorkflow';
import { WorkflowStep } from '@/types/workflow.d';
import SuperAdminSetupModal from '@/components/SuperAdminSetupModal';
import PricingModal from '@/components/PricingModal';
import OrganizationSetupModal from '@/components/OrganizationSetupModal';
import SmsValidationModal from '@/components/SmsValidationModal';
import GarageSetupModal from '@/components/GarageSetupModal';
import { toast } from 'sonner';

interface NewInitializationWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

const NewInitializationWizard: React.FC<NewInitializationWizardProps> = ({
  isOpen,
  onComplete
}) => {
  const { state, completeStep, isLoading, error } = useWorkflow();
  const { session } = useAuthWorkflow();

  console.log('🎭 [NewInitializationWizard] État actuel:', state);

  // Gestionnaire de progression
  const handleStepComplete = async (stepData?: any) => {
    try {
      console.log('🎯 [NewInitializationWizard] Complétion étape:', state.currentStep, stepData);
      
      if (state.currentStep === 'garage_setup') {
        // Dernière étape, terminer le workflow
        await completeStep(state.currentStep);
        onComplete();
        return;
      }

      await completeStep(state.currentStep);
      toast.success(`Étape ${state.currentStep} complétée !`);
    } catch (err) {
      console.error('❌ [NewInitializationWizard] Erreur progression:', err);
      toast.error('Erreur lors de la progression');
    }
  };

  // Calcul progression
  const progress = {
    current: state.completedSteps.length + 1,
    total: 6,
    stepName: getStepDisplayName(state.currentStep)
  };

  // Affichage du nom de l'étape
  function getStepDisplayName(step: WorkflowStep): string {
    const names = {
      'super_admin_check': 'Vérification Super Admin',
      'pricing_selection': 'Sélection Plan',
      'admin_creation': 'Création Admin',
      'org_creation': 'Création Organisation',
      'sms_validation': 'Validation SMS',
      'garage_setup': 'Configuration Garage',
      'dashboard': 'Terminé'
    };
    return names[step] || step;
  }

  // Barre de progression
  const ProgressBar = () => (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-primary">
            Étape {progress.current} sur {progress.total}
          </div>
          <div className="text-sm text-muted-foreground">
            {progress.stepName}
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Rendu de l'étape courante
  const renderCurrentStep = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du workflow...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-destructive text-lg mb-4">Erreur Workflow</div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }

    switch (state.currentStep) {
      case 'super_admin_check':
        return (
          <SuperAdminSetupModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            mode="super-admin"
            adminData={{
              email: '',
              password: '',
              phone: '',
              name: '',
              avatarFile: null
            }}
            onAdminDataChange={() => {}}
            showPassword={false}
            onToggleShowPassword={() => {}}
            isLoading={false}
            selectedPlan=""
          />
        );

      case 'pricing_selection':
        return (
          <PricingModal
            isOpen={isOpen}
            onSelectPlan={handleStepComplete}
          />
        );

      case 'admin_creation':
        return (
          <SuperAdminSetupModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            mode="normal"
            adminData={{
              email: '',
              password: '',
              phone: '',
              name: '',
              avatarFile: null
            }}
            onAdminDataChange={() => {}}
            showPassword={false}
            onToggleShowPassword={() => {}}
            isLoading={false}
            selectedPlan=""
          />
        );

      case 'org_creation':
        return (
          <OrganizationSetupModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            selectedPlan=""
          />
        );

      case 'sms_validation':
        return (
          <SmsValidationModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            organizationName=""
            organizationCode=""
            adminName=""
          />
        );

      case 'garage_setup':
        return (
          <GarageSetupModal
            isOpen={isOpen}
            onComplete={handleStepComplete}
            organizationName=""
          />
        );

      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-lg text-muted-foreground">Workflow terminé</div>
              <button 
                onClick={onComplete}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 mt-4"
              >
                Accéder au Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <ProgressBar />
      <div className="pt-20">
        {renderCurrentStep()}
      </div>
    </>
  );
};

export default NewInitializationWizard;