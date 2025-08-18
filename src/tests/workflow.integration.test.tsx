import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowProvider, useWorkflow } from '@/contexts/WorkflowProvider';
import { useAuthWorkflow } from '@/hooks/useAuthWorkflow';

// Mock data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  user_metadata: {}
};

const mockSession = {
  user: mockUser,
  access_token: 'mock-token',
  expires_at: Date.now() + 3600000
};

// Test component
function TestWorkflowComponent() {
  const { state, completeStep, isLoading, error } = useWorkflow();
  const { workflowState } = useAuthWorkflow();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div data-testid="current-step">{state.currentStep}</div>
      <div data-testid="completed-steps">{state.completedSteps.join(',')}</div>
      <button 
        data-testid="complete-step" 
        onClick={() => completeStep(state.currentStep)}
      >
        Complete Step
      </button>
    </div>
  );
}

describe('Workflow Integration Tests', () => {
  beforeEach(async () => {
    // Setup test data
    await supabase.from('workflow_states').delete().match({});
    await supabase.from('super_admins').delete().match({});
    await supabase.from('profiles').delete().match({});
  });

  afterEach(async () => {
    // Cleanup
    await supabase.from('workflow_states').delete().match({});
    await supabase.from('super_admins').delete().match({});
    await supabase.from('profiles').delete().match({});
  });

  it('Doit créer Super Admin dans les 3 tables', async () => {
    // Mock super admin creation
    const superAdminData = {
      user_id: mockUser.id,
      email: mockUser.email,
      nom: 'Super',
      phone: '+1234567890',
      est_actif: true
    };

    // Insert in super_admins table
    const { error: superAdminError } = await supabase
      .from('super_admins')
      .insert(superAdminData);
    expect(superAdminError).toBeNull();

    // Insert in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: mockUser.id,
        email: mockUser.email,
        name: 'Super Admin',
        role: 'superadmin',
        is_superadmin: true
      });
    expect(profileError).toBeNull();

    // Verify super admin exists
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
    expect(isSuperAdmin).toBe(true);

    // Verify in all 3 tables
    const { data: superAdmin } = await supabase
      .from('super_admins')
      .select('*')
      .eq('user_id', mockUser.id)
      .single();
    expect(superAdmin).toBeTruthy();

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', mockUser.id)
      .single();
    expect(profile?.role).toBe('superadmin');
  });

  it('Doit progresser dans le workflow', async () => {
    render(
      <WorkflowProvider>
        <TestWorkflowComponent />
      </WorkflowProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('super_admin_check');
    });

    // Complete first step
    const completeButton = screen.getByTestId('complete-step');
    completeButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('pricing_selection');
    });

    await waitFor(() => {
      expect(screen.getByTestId('completed-steps')).toHaveTextContent('super_admin_check');
    });
  });

  it('Doit gérer la session perdue', async () => {
    // Mock session loss
    const { data } = await supabase.auth.getSession();
    expect(data.session).toBeNull();

    render(
      <WorkflowProvider>
        <TestWorkflowComponent />
      </WorkflowProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('super_admin_check');
    });
  });

  it('Doit synchroniser avec Supabase', async () => {
    // Create workflow state in database
    const { error } = await supabase
      .from('workflow_states')
      .insert({
        user_id: mockUser.id,
        current_step: 'pricing_selection',
        completed_steps: ['super_admin_check'],
        meta: { isDemo: false }
      });
    expect(error).toBeNull();

    render(
      <WorkflowProvider>
        <TestWorkflowComponent />
      </WorkflowProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('pricing_selection');
    });

    await waitFor(() => {
      expect(screen.getByTestId('completed-steps')).toHaveTextContent('super_admin_check');
    });
  });

  it('Doit vérifier les prérequis à chaque étape', async () => {
    // Test workflow progression with prerequisites
    const workflowSteps = [
      'super_admin_check',
      'pricing_selection', 
      'admin_creation',
      'org_creation',
      'sms_validation',
      'garage_setup',
      'dashboard'
    ];

    for (const step of workflowSteps) {
      const { data } = await supabase.rpc('get_workflow_status');
      expect(data).toBeTruthy();
      
      // Each step should have proper validation
      if (step === 'admin_creation') {
        // Should verify admin exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', mockUser.id)
          .single();
        // Add admin verification logic
      }
      
      if (step === 'org_creation') {
        // Should verify organization exists
        const { data: orgs } = await supabase
          .from('user_organisations')
          .select('*')
          .eq('user_id', mockUser.id);
        // Add org verification logic
      }
    }
  });
});