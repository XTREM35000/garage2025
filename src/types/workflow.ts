export const WORKFLOW_STEPS = {
  LOADING: 'loading',
  SUPER_ADMIN: 'super-admin',
  PRICING: 'pricing',
  CREATE_ADMIN: 'create-admin',
  CREATE_ORGANIZATION: 'create-organization',
  SMS_VALIDATION: 'sms-validation',
  GARAGE_SETUP: 'garage-setup',
  COMPLETE: 'complete'
} as const;

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
  metadata?: Record<string, unknown>;
  loading?: boolean;
  error?: string | null;
}

export interface WorkflowContextType {
  state: WorkflowState;
  completeStep: (step: WorkflowStep) => Promise<void>;
  reset: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const WORKFLOW_STEP_ORDER: readonly WorkflowStep[] = [
  'super_admin_check',
  'pricing_selection',
  'admin_creation',
  'org_creation',
  'sms_validation',
  'garage_setup',
  'dashboard'
] as const;

export const getNextStep = (currentStep: WorkflowStep): WorkflowStep => {
  const currentIndex = WORKFLOW_STEP_ORDER.indexOf(currentStep);
  return WORKFLOW_STEP_ORDER[currentIndex + 1] || 'dashboard';
};

export const isValidWorkflowStep = (step: unknown): step is WorkflowStep => {
  return typeof step === 'string' && WORKFLOW_STEP_ORDER.includes(step as WorkflowStep);
};

export const parseWorkflowState = (data: any): WorkflowState => {
  return {
    currentStep: isValidWorkflowStep(data.current_step) ? data.current_step : 'super_admin_check',
    completedSteps: Array.isArray(data.completed_steps) ? data.completed_steps : [],
    isDemo: Boolean(data.meta?.isDemo),
    userId: data.user_id,
    lastActiveOrg: data.meta?.lastActiveOrg,
    metadata: data.meta || {},
    loading: false,
    error: null
  };
};