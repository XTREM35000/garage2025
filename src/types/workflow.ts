export const WORKFLOW_STEPS = {
  SUPER_ADMIN: 'super-admin',
  PRICING: 'pricing',
  CREATE_ADMIN: 'create-admin',
  CREATE_ORGANIZATION: 'create-organization',
  SMS_VALIDATION: 'sms-validation',
  GARAGE_SETUP: 'garage-setup',
  COMPLETE: 'complete'
} as const;

export type WorkflowStep = typeof WORKFLOW_STEPS[keyof typeof WORKFLOW_STEPS];
export type ExtendedInitializationStep = WorkflowStep;
export type WorkflowState = 'loading' | 'needs-init' | 'needs-auth' | 'ready' | 'completed';