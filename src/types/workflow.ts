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
  loading: boolean;
  data?: Record<string, any>;
  error?: string;
}

export interface WorkflowContextType {
  state: WorkflowState;
  updateStep: (step: WorkflowStep, data?: any) => Promise<void>;
  resetWorkflow: () => void;
}