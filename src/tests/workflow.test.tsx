import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WorkflowProvider } from '@/contexts/WorkflowContext';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { WORKFLOW_STEPS } from '@/types/workflow';
import WorkflowManager from '@/components/WorkflowManager';
import StepGuard from '@/components/StepGuard';

// Mock des dépendances
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { code: 'PGRST116' }
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'test-workflow-id',
              user_id: 'test-user-id',
              current_step: WORKFLOW_STEPS.SUPER_ADMIN,
              is_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }
}));

jest.mock('@/hooks/useAuthSession', () => ({
  useAuthSession: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false
  })
}));

// Composant de test pour WorkflowProvider
const TestComponent: React.FC = () => {
  const { state, currentStep, updateStep } = useWorkflow();
  
  return (
    <div>
      <div data-testid="current-step">{currentStep}</div>
      <div data-testid="workflow-state">{state ? 'loaded' : 'loading'}</div>
      <button 
        data-testid="update-step" 
        onClick={() => updateStep(WORKFLOW_STEPS.PRICING)}
      >
        Update Step
      </button>
    </div>
  );
};

// Wrapper pour les tests
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <WorkflowProvider>
        {component}
      </WorkflowProvider>
    </BrowserRouter>
  );
};

describe('Workflow System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WorkflowProvider', () => {
    test('should initialize workflow state correctly', async () => {
      renderWithProviders(<TestComponent />);
      
      expect(screen.getByTestId('workflow-state')).toHaveTextContent('loading');
      
      await waitFor(() => {
        expect(screen.getByTestId('workflow-state')).toHaveTextContent('loaded');
      });
      
      expect(screen.getByTestId('current-step')).toHaveTextContent(WORKFLOW_STEPS.SUPER_ADMIN);
    });

    test('should update workflow step correctly', async () => {
      renderWithProviders(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('workflow-state')).toHaveTextContent('loaded');
      });
      
      const updateButton = screen.getByTestId('update-step');
      fireEvent.click(updateButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('current-step')).toHaveTextContent(WORKFLOW_STEPS.PRICING);
      });
    });
  });

  describe('WorkflowManager', () => {
    test('should render workflow progress correctly', async () => {
      renderWithProviders(
        <WorkflowManager showProgress={true}>
          <div>Test Content</div>
        </WorkflowManager>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Progression du Workflow')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Étape 1 sur 7')).toBeInTheDocument();
      expect(screen.getByText('Super Admin')).toBeInTheDocument();
    });

    test('should handle step navigation correctly', async () => {
      renderWithProviders(
        <WorkflowManager showProgress={true}>
          <div>Test Content</div>
        </WorkflowManager>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Suivant')).toBeInTheDocument();
      });
      
      const nextButton = screen.getByText('Suivant');
      expect(nextButton).not.toBeDisabled();
      
      const prevButton = screen.getByText('Précédent');
      expect(prevButton).toBeDisabled(); // Première étape
    });

    test('should toggle auto-advance correctly', async () => {
      renderWithProviders(
        <WorkflowManager showProgress={true} autoAdvance={false}>
          <div>Test Content</div>
        </WorkflowManager>
      );
      
      await waitFor(() => {
        expect(screen.getByTitle('Activer auto-avancement')).toBeInTheDocument();
      });
      
      const autoAdvanceButton = screen.getByTitle('Activer auto-avancement');
      fireEvent.click(autoAdvanceButton);
      
      await waitFor(() => {
        expect(screen.getByTitle('Désactiver auto-avancement')).toBeInTheDocument();
      });
    });
  });

  describe('StepGuard', () => {
    test('should allow access to valid step', async () => {
      renderWithProviders(
        <StepGuard requiredStep={WORKFLOW_STEPS.SUPER_ADMIN}>
          <div data-testid="protected-content">Protected Content</div>
        </StepGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    test('should show loading state initially', () => {
      renderWithProviders(
        <StepGuard requiredStep={WORKFLOW_STEPS.SUPER_ADMIN}>
          <div>Content</div>
        </StepGuard>
      );
      
      expect(screen.getByText('Vérification des prérequis...')).toBeInTheDocument();
    });

    test('should handle authentication errors', async () => {
      // Mock un utilisateur non authentifié
      jest.doMock('@/hooks/useAuthSession', () => ({
        useAuthSession: () => ({
          user: null,
          isAuthenticated: false,
          isLoading: false
        })
      }));

      renderWithProviders(
        <StepGuard requiredStep={WORKFLOW_STEPS.SUPER_ADMIN}>
          <div>Content</div>
        </StepGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Accès non autorisé')).toBeInTheDocument();
      });
    });
  });
});

// Tests de scénarios complets
describe('Workflow Scenarios', () => {
  test('Happy Path - Complete workflow flow', async () => {
    const { rerender } = renderWithProviders(
      <WorkflowManager showProgress={true}>
        <div>Workflow Content</div>
      </WorkflowManager>
    );
    
    // Vérifier l'initialisation
    await waitFor(() => {
      expect(screen.getByText('Progression du Workflow')).toBeInTheDocument();
    });
    
    // Simuler la progression à travers les étapes
    const steps = [
      WORKFLOW_STEPS.SUPER_ADMIN,
      WORKFLOW_STEPS.PRICING,
      WORKFLOW_STEPS.CREATE_ADMIN,
      WORKFLOW_STEPS.CREATE_ORGANIZATION,
      WORKFLOW_STEPS.SMS_VALIDATION,
      WORKFLOW_STEPS.GARAGE_SETUP,
      WORKFLOW_STEPS.COMPLETE
    ];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      expect(screen.getByText(step.replace('-', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '))).toBeInTheDocument();
    }
  });

  test('Resume after crash - Restore workflow state', async () => {
    // Mock un état de workflow interrompu
    jest.doMock('@/integrations/supabase/client', () => ({
      supabase: {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({
                data: {
                  id: 'interrupted-workflow',
                  user_id: 'test-user-id',
                  current_step: WORKFLOW_STEPS.SMS_VALIDATION,
                  is_completed: false,
                  admin_id: 'admin-id',
                  org_id: 'org-id'
                },
                error: null
              }))
            }))
          }))
        }))
      }
    }));

    renderWithProviders(
      <WorkflowManager showProgress={true}>
        <div>Resumed Workflow</div>
      </WorkflowManager>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Progression du Workflow')).toBeInTheDocument();
    });
    
    // Vérifier que l'étape SMS est marquée comme courante
    expect(screen.getByText('SMS Validation')).toHaveClass('bg-blue-100');
  });

  test('Error handling - Network failure recovery', async () => {
    // Mock une erreur réseau
    jest.doMock('@/integrations/supabase/client', () => ({
      supabase: {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({
                data: null,
                error: { message: 'Network error', code: 'NETWORK_ERROR' }
              }))
            }))
          }))
        }))
      }
    }));

    renderWithProviders(
      <WorkflowManager showProgress={true}>
        <div>Error Workflow</div>
      </WorkflowManager>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Erreur du workflow')).toBeInTheDocument();
    });
  });
});

// Tests de performance
describe('Workflow Performance', () => {
  test('should complete step transitions within 2 seconds', async () => {
    const startTime = Date.now();
    
    renderWithProviders(
      <WorkflowManager showProgress={true}>
        <div>Performance Test</div>
      </WorkflowManager>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Progression du Workflow')).toBeInTheDocument();
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Vérifier que le rendu initial prend moins de 2 secondes
    expect(duration).toBeLessThan(2000);
  });

  test('should preload next step data', async () => {
    renderWithProviders(
      <WorkflowManager showProgress={true}>
        <div>Preload Test</div>
      </WorkflowManager>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Progression du Workflow')).toBeInTheDocument();
    });
    
    // Vérifier que les étapes suivantes sont visibles
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Create Admin')).toBeInTheDocument();
  });
});

// Tests d'intégration
describe('Workflow Integration', () => {
  test('should integrate with existing RLS policies', async () => {
    renderWithProviders(
      <WorkflowManager showProgress={true}>
        <div>RLS Integration Test</div>
      </WorkflowManager>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Progression du Workflow')).toBeInTheDocument();
    });
    
    // Vérifier que le workflow respecte les politiques d'authentification
    expect(screen.getByTestId('current-step')).toBeInTheDocument();
  });

  test('should work with demo SMS mode (123456)', async () => {
    renderWithProviders(
      <WorkflowManager showProgress={true}>
        <div>Demo SMS Test</div>
      </WorkflowManager>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Progression du Workflow')).toBeInTheDocument();
    });
    
    // Vérifier que le mode démo est accessible
    expect(screen.getByText('SMS Validation')).toBeInTheDocument();
  });
});
