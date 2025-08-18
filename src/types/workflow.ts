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

export type WorkflowStep = keyof typeof WORKFLOW_STEPS;
export type ExtendedInitializationStep = WorkflowStep;
export type WorkflowState = 'loading' | 'needs-init' | 'needs-auth' | 'ready' | 'completed';

// Nouveaux types pour le système workflow_states
export interface WorkflowStateData {
  current_step: string;
  loading: boolean;
  last_updated: string;
  data?: Record<string, any>;
}

export interface WorkflowContextType {
  state: WorkflowStateData | null;
  currentStep: WorkflowStep;
  isLoading: boolean;
  error: WorkflowError | null;
  refresh: () => Promise<void>;
  updateStep: (step: WorkflowStep, data?: Partial<WorkflowStateData>) => Promise<void>;
  completeStep: (step: WorkflowStep) => Promise<void>;
  resetWorkflow: () => Promise<void>;
}

export interface WorkflowError {
  step: string;
  type: 'rpc' | 'auth' | 'rls' | 'network';
  message: string;
  timestamp: Date;
  details?: any;
}

export interface WorkflowTransition {
  from: WorkflowStep;
  to: WorkflowStep;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface WorkflowLog {
  id: string;
  user_id: string;
  transition: WorkflowTransition;
  metadata?: Record<string, any>;
}