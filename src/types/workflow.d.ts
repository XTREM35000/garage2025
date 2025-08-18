// src/types/workflow.d.ts
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
  loading?: boolean;
  error?: string | null;
}

export interface WorkflowError {
  step: WorkflowStep;
  type: 'auth' | 'rls' | 'rpc' | 'network' | 'validation' | 'timeout';
  message: string;
  timestamp: Date;
  details?: any;
}

export interface WorkflowContextType {
  state: WorkflowState;
  completeStep: (step: WorkflowStep) => Promise<void>;
  reset: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  validateFormField: (field: string, value: string) => { isValid: boolean; error?: string };
}

// Déclarations seulement (pas d'implémentation)
export declare const WORKFLOW_STEP_ORDER: WorkflowStep[];
export declare function getNextStep(currentStep: WorkflowStep): WorkflowStep;