// src/lib/workflow.ts
import type { WorkflowStep } from '@/types/workflow';

/**
 * L'ordre strict des étapes du workflow
 * (Doit correspondre exactement aux types déclarés dans workflow.d.ts)
 */
export const WORKFLOW_STEP_ORDER: readonly WorkflowStep[] = [
  'super_admin_check',
  'pricing_selection',
  'admin_creation',
  'org_creation',
  'sms_validation',
  'garage_setup',
  'dashboard'
] as const;

/**
 * Détermine la prochaine étape du workflow
 * @param currentStep L'étape actuelle
 * @returns La prochaine étape ou 'dashboard' si dernière étape
 * @throws Si l'étape actuelle n'est pas valide
 */
export const getNextStep = (currentStep: WorkflowStep): WorkflowStep => {
  const currentIndex = WORKFLOW_STEP_ORDER.indexOf(currentStep);

  if (currentIndex === -1) {
    console.error(`Étape inconnue: ${currentStep}`);
    return 'dashboard'; // Retour au dashboard en cas d'erreur
  }

  return WORKFLOW_STEP_ORDER[currentIndex + 1] ?? 'dashboard';
};

/**
 * Vérifie si une étape est la dernière du workflow
 */
export const isFinalStep = (step: WorkflowStep): boolean => {
  return step === 'dashboard';
};

/**
 * Vérifie la validité d'une étape
 */
export const isValidStep = (step: string): step is WorkflowStep => {
  return WORKFLOW_STEP_ORDER.includes(step as WorkflowStep);
};