export type WorkflowStep = 
  | 'super_admin_check'
  | 'pricing_selection'
  | 'admin_creation'
  | 'org_creation'
  | 'sms_validation'
  | 'garage_setup'
  | 'dashboard';

export interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  lastActiveOrg?: string;
  isDemo: boolean;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowContextType {
  state: WorkflowState;
  completeStep: (step: WorkflowStep) => Promise<void>;
  reset: () => void;
  isLoading: boolean;
  error: string | null;
}

export const WORKFLOW_STEP_ORDER: WorkflowStep[] = [
  'super_admin_check',
  'pricing_selection', 
  'admin_creation',
  'org_creation',
  'sms_validation',
  'garage_setup',
  'dashboard'
];

export const getNextStep = (currentStep: WorkflowStep): WorkflowStep => {
  const currentIndex = WORKFLOW_STEP_ORDER.indexOf(currentStep);
  return WORKFLOW_STEP_ORDER[currentIndex + 1] || 'dashboard';
};