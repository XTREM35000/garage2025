import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { useAuthSession } from '@/hooks/useAuthSession';
import { WORKFLOW_STEPS, WorkflowStep, WorkflowTransition } from '@/types/workflow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw,
  Play,
  Pause,
  SkipForward
} from 'lucide-react';

interface WorkflowManagerProps {
  children: React.ReactNode;
  autoAdvance?: boolean;
  showProgress?: boolean;
  onStepChange?: (step: WorkflowStep) => void;
}

interface WorkflowProgress {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  remainingSteps: WorkflowStep[];
  progressPercentage: number;
  estimatedTimeRemaining: number; // en secondes
}

const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  children,
  autoAdvance = false,
  showProgress = true,
  onStepChange
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthSession();
  const { 
    state, 
    currentStep, 
    isLoading, 
    error, 
    updateStep, 
    completeStep, 
    refresh 
  } = useWorkflow();
  
  const [progress, setProgress] = useState<WorkflowProgress | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionHistory, setTransitionHistory] = useState<WorkflowTransition[]>([]);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(autoAdvance);

  // Définir l'ordre des étapes
  const STEP_ORDER: WorkflowStep[] = [
    WORKFLOW_STEPS.SUPER_ADMIN,
    WORKFLOW_STEPS.PRICING,
    WORKFLOW_STEPS.CREATE_ADMIN,
    WORKFLOW_STEPS.CREATE_ORGANIZATION,
    WORKFLOW_STEPS.SMS_VALIDATION,
    WORKFLOW_STEPS.GARAGE_SETUP,
    WORKFLOW_STEPS.COMPLETE
  ];

  // Calculer la progression du workflow
  const calculateProgress = useCallback((): WorkflowProgress => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    const completedSteps = STEP_ORDER.slice(0, currentIndex);
    const remainingSteps = STEP_ORDER.slice(currentIndex + 1);
    const progressPercentage = ((currentIndex + 1) / STEP_ORDER.length) * 100;
    
    // Estimation du temps restant (2s par étape comme demandé)
    const estimatedTimeRemaining = remainingSteps.length * 2;

    return {
      currentStep,
      completedSteps,
      remainingSteps,
      progressPercentage,
      estimatedTimeRemaining
    };
  }, [currentStep]);

  // Mettre à jour la progression
  useEffect(() => {
    if (currentStep) {
      const newProgress = calculateProgress();
      setProgress(newProgress);
      onStepChange?.(currentStep);
    }
  }, [currentStep, calculateProgress, onStepChange]);

  // Fonction pour passer à l'étape suivante
  const advanceToNextStep = useCallback(async (): Promise<void> => {
    if (!state || isTransitioning) return;

    try {
      setIsTransitioning(true);
      
      const currentIndex = STEP_ORDER.indexOf(currentStep);
      const nextStep = STEP_ORDER[currentIndex + 1];
      
      if (!nextStep) {
        console.log('✅ [WorkflowManager] Workflow terminé');
        return;
      }

      console.log(`🔄 [WorkflowManager] Transition de ${currentStep} vers ${nextStep}`);
      
      // Enregistrer la transition
      const transition: WorkflowTransition = {
        from: currentStep,
        to: nextStep,
        timestamp: new Date(),
        success: true
      };

      setTransitionHistory(prev => [...prev, transition]);

      // Mettre à jour l'étape dans le backend
      await updateStep(nextStep);
      
      // Naviguer vers la nouvelle étape
      navigate(`/workflow/${nextStep}`);
      
      toast.success(`Étape ${nextStep} activée`);
      
    } catch (err) {
      console.error('❌ [WorkflowManager] Erreur lors de l\'avancement:', err);
      
      const transition: WorkflowTransition = {
        from: currentStep,
        to: currentStep, // Reste sur la même étape en cas d'erreur
        timestamp: new Date(),
        success: false,
        error: err instanceof Error ? err.message : 'Erreur inconnue'
      };

      setTransitionHistory(prev => [...prev, transition]);
      toast.error('Erreur lors de l\'avancement de l\'étape');
    } finally {
      setIsTransitioning(false);
    }
  }, [state, currentStep, isTransitioning, updateStep, navigate]);

  // Fonction pour revenir à l'étape précédente
  const goToPreviousStep = useCallback(async (): Promise<void> => {
    if (!state || isTransitioning) return;

    try {
      setIsTransitioning(true);
      
      const currentIndex = STEP_ORDER.indexOf(currentStep);
      const previousStep = STEP_ORDER[currentIndex - 1];
      
      if (!previousStep) {
        console.log('⚠️ [WorkflowManager] Déjà à la première étape');
        return;
      }

      console.log(`🔄 [WorkflowManager] Retour de ${currentStep} vers ${previousStep}`);
      
      // Mettre à jour l'étape dans le backend
      await updateStep(previousStep);
      
      // Naviguer vers l'étape précédente
      navigate(`/workflow/${previousStep}`);
      
      toast.info(`Retour à l'étape ${previousStep}`);
      
    } catch (err) {
      console.error('❌ [WorkflowManager] Erreur lors du retour:', err);
      toast.error('Erreur lors du retour à l\'étape précédente');
    } finally {
      setIsTransitioning(false);
    }
  }, [state, currentStep, isTransitioning, updateStep, navigate]);

  // Fonction pour sauter vers une étape spécifique
  const jumpToStep = useCallback(async (targetStep: WorkflowStep): Promise<void> => {
    if (!state || isTransitioning) return;

    try {
      setIsTransitioning(true);
      
      console.log(`🔄 [WorkflowManager] Saut vers ${targetStep}`);
      
      // Mettre à jour l'étape dans le backend
      await updateStep(targetStep);
      
      // Naviguer vers l'étape cible
      navigate(`/workflow/${targetStep}`);
      
      toast.success(`Passage à l'étape ${targetStep}`);
      
    } catch (err) {
      console.error('❌ [WorkflowManager] Erreur lors du saut:', err);
      toast.error('Erreur lors du passage à l\'étape');
    } finally {
      setIsTransitioning(false);
    }
  }, [state, isTransitioning, updateStep, navigate]);

  // Auto-avancement
  useEffect(() => {
    if (!autoAdvanceEnabled || !state || isTransitioning) return;

    const timer = setTimeout(() => {
      if (progress && progress.remainingSteps.length > 0) {
        advanceToNextStep();
      }
    }, 2000); // 2 secondes comme demandé

    return () => clearTimeout(timer);
  }, [autoAdvanceEnabled, state, isTransitioning, progress, advanceToNextStep]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      console.error('❌ [WorkflowManager] Erreur workflow détectée:', error);
      toast.error(`Erreur workflow: ${error.message}`);
    }
  }, [error]);

  // Afficher le loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Initialisation du workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-manager">
      {/* Barre de progression */}
      {showProgress && progress && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Progression du Workflow
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoAdvanceEnabled(!autoAdvanceEnabled)}
                className={`p-2 rounded-md transition-colors ${
                  autoAdvanceEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={autoAdvanceEnabled ? 'Désactiver auto-avancement' : 'Activer auto-avancement'}
              >
                {autoAdvanceEnabled ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <button
                onClick={refresh}
                className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Étape {STEP_ORDER.indexOf(currentStep) + 1} sur {STEP_ORDER.length}</span>
              <span>{Math.round(progress.progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Étapes */}
          <div className="grid grid-cols-7 gap-2 text-xs">
            {STEP_ORDER.map((step, index) => {
              const isCompleted = progress.completedSteps.includes(step);
              const isCurrent = step === currentStep;
              const isUpcoming = progress.remainingSteps.includes(step);

              return (
                <div
                  key={step}
                  className={`p-2 rounded text-center transition-colors ${
                    isCompleted 
                      ? 'bg-green-100 text-green-700' 
                      : isCurrent 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : isUpcoming 
                          ? 'bg-gray-100 text-gray-500' 
                          : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {isCompleted ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : isCurrent ? (
                      <div className="h-3 w-3 bg-blue-600 rounded-full animate-pulse" />
                    ) : (
                      <div className="h-3 w-3 bg-gray-300 rounded-full" />
                    )}
                  </div>
                  <span className="truncate block">
                    {step.replace('-', ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Contrôles de navigation */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousStep}
                disabled={STEP_ORDER.indexOf(currentStep) === 0 || isTransitioning}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <button
                onClick={advanceToNextStep}
                disabled={STEP_ORDER.indexOf(currentStep) === STEP_ORDER.length - 1 || isTransitioning}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>

            <div className="text-sm text-gray-500">
              {progress.estimatedTimeRemaining > 0 && (
                <span>Temps estimé: {progress.estimatedTimeRemaining}s</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="workflow-content">
        {children}
      </div>

      {/* Historique des transitions (debug) */}
      {process.env.NODE_ENV === 'development' && transitionHistory.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Historique des transitions (Debug)</h4>
          <div className="space-y-1 text-xs">
            {transitionHistory.slice(-5).map((transition, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded ${
                  transition.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {transition.from} → {transition.to}
                </span>
                <span className="text-gray-500">
                  {transition.timestamp.toLocaleTimeString()}
                </span>
                {transition.error && (
                  <span className="text-red-600">⚠️ {transition.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManager;
