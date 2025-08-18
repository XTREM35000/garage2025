import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { useAuthSession } from '@/hooks/useAuthSession';
import { WORKFLOW_STEPS, WorkflowStep } from '@/types/workflow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface StepGuardProps {
  children: React.ReactNode;
  requiredStep: WorkflowStep;
  fallbackStep?: WorkflowStep;
  showLoading?: boolean;
}

interface StepPrerequisites {
  isAuthenticated: boolean;
  hasWorkflowState: boolean;
  currentStep: WorkflowStep;
  canAccess: boolean;
  missingRequirements: string[];
}

const StepGuard: React.FC<StepGuardProps> = ({
  children,
  requiredStep,
  fallbackStep,
  showLoading = true
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthSession();
  const { state, currentStep, isLoading, error } = useWorkflow();
  const [prerequisites, setPrerequisites] = useState<StepPrerequisites | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Vérifier les prérequis pour l'étape demandée
  const checkStepPrerequisites = async (): Promise<StepPrerequisites> => {
    const missingRequirements: string[] = [];
    let canAccess = true;

    // 1. Vérifier l'authentification
    if (!isAuthenticated) {
      missingRequirements.push('Authentification requise');
      canAccess = false;
    }

    // 2. Vérifier l'état du workflow
    if (!state) {
      missingRequirements.push('État du workflow non initialisé');
      canAccess = false;
    }

    // 3. Vérifier la progression du workflow
    if (state && !canAccessStep(requiredStep, currentStep)) {
      missingRequirements.push(`Étape ${requiredStep} non accessible depuis ${currentStep}`);
      canAccess = false;
    }

    // 4. Vérifier les prérequis spécifiques à l'étape
    const stepSpecificRequirements = await checkStepSpecificRequirements(requiredStep);
    missingRequirements.push(...stepSpecificRequirements);
    
    if (stepSpecificRequirements.length > 0) {
      canAccess = false;
    }

    return {
      isAuthenticated,
      hasWorkflowState: !!state,
      currentStep,
      canAccess,
      missingRequirements
    };
  };

  // Vérifier si l'étape demandée est accessible depuis l'étape courante
  const canAccessStep = (targetStep: WorkflowStep, currentStep: WorkflowStep): boolean => {
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
    const targetIndex = stepOrder.indexOf(targetStep);

    // Permettre l'accès à l'étape courante et aux étapes précédentes
    return targetIndex <= currentIndex;
  };

  // Vérifier les prérequis spécifiques à chaque étape
  const checkStepSpecificRequirements = async (step: WorkflowStep): Promise<string[]> => {
    const missingRequirements: string[] = [];

    try {
      switch (step) {
        case WORKFLOW_STEPS.CREATE_ADMIN:
          // Vérifier si l'utilisateur n'est pas déjà admin
          if (state?.admin_id) {
            missingRequirements.push('Admin déjà créé');
          }
          break;

        case WORKFLOW_STEPS.CREATE_ORGANIZATION:
          // Vérifier si l'admin existe
          if (!state?.admin_id) {
            missingRequirements.push('Admin doit être créé en premier');
          }
          break;

        case WORKFLOW_STEPS.SMS_VALIDATION:
          // Vérifier si l'organisation existe
          if (!state?.org_id) {
            missingRequirements.push('Organisation doit être créée en premier');
          }
          break;

        case WORKFLOW_STEPS.GARAGE_SETUP:
          // Vérifier si la validation SMS est passée
          if (!state?.org_id) {
            missingRequirements.push('Organisation doit être créée en premier');
          }
          break;

        case WORKFLOW_STEPS.COMPLETE:
          // Vérifier si toutes les étapes précédentes sont complétées
          if (!state?.is_completed) {
            missingRequirements.push('Toutes les étapes précédentes doivent être complétées');
          }
          break;
      }
    } catch (err) {
      console.error('❌ [StepGuard] Erreur lors de la vérification des prérequis:', err);
      missingRequirements.push('Erreur lors de la vérification des prérequis');
    }

    return missingRequirements;
  };

  // Effet pour vérifier les prérequis
  useEffect(() => {
    const validateAccess = async () => {
      if (!isLoading) {
        setIsChecking(true);
        const prereqs = await checkStepPrerequisites();
        setPrerequisites(prereqs);
        setIsChecking(false);

        // Rediriger si l'accès n'est pas autorisé
        if (!prereqs.canAccess) {
          const redirectStep = fallbackStep || getFallbackStep(prereqs);
          console.log(`🚫 [StepGuard] Accès refusé à ${requiredStep}, redirection vers ${redirectStep}`);
          
          // Afficher un toast d'erreur
          toast.error(`Accès refusé: ${prereqs.missingRequirements.join(', ')}`);
          
          // Rediriger vers l'étape appropriée
          navigate(`/workflow/${redirectStep}`);
        }
      }
    };

    validateAccess();
  }, [isLoading, state, currentStep, requiredStep, fallbackStep, navigate]);

  // Déterminer l'étape de fallback appropriée
  const getFallbackStep = (prereqs: StepPrerequisites): WorkflowStep => {
    if (!prereqs.isAuthenticated) {
      return WORKFLOW_STEPS.SUPER_ADMIN;
    }

    if (!prereqs.hasWorkflowState) {
      return WORKFLOW_STEPS.SUPER_ADMIN;
    }

    // Retourner à l'étape courante si l'étape demandée n'est pas accessible
    return prereqs.currentStep;
  };

  // Afficher le loading
  if (isLoading || isChecking) {
    if (!showLoading) return null;
    
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Vérification des prérequis...</p>
        </div>
      </div>
    );
  }

  // Afficher les erreurs
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center space-y-4 p-6 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <h3 className="text-lg font-medium text-red-800">Erreur du workflow</h3>
          <p className="text-sm text-red-600 text-center">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Vérifier si l'accès est autorisé
  if (prerequisites && !prerequisites.canAccess) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center space-y-4 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertCircle className="h-8 w-8 text-yellow-600" />
          <h3 className="text-lg font-medium text-yellow-800">Accès non autorisé</h3>
          <p className="text-sm text-yellow-600 text-center">
            {prerequisites.missingRequirements.join(', ')}
          </p>
          <p className="text-xs text-yellow-500">
            Redirection en cours...
          </p>
        </div>
      </div>
    );
  }

  // Accès autorisé, afficher le contenu
  return (
    <div className="step-guard-content">
      {children}
    </div>
  );
};

export default StepGuard;
