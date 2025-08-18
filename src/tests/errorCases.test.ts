import { workflowErrorHandler, handleWorkflowError, getWorkflowErrorStats } from '@/utils/errorHandlers';
import { logWorkflowError, getWorkflowLogs } from '@/utils/workflowLogger';
import { WORKFLOW_STEPS } from '@/types/workflow';

// Mock des dépendances
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      refreshSession: jest.fn(() => ({
        data: { session: null },
        error: null
      }))
    }
  }
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
    success: jest.fn()
  }
}));

describe('Workflow Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Nettoyer l'historique des erreurs
    workflowErrorHandler.clearErrorHistory();
  });

  describe('Error Categorization', () => {
    test('should categorize RPC errors correctly', async () => {
      const rpcError = { code: 'PGRST301', message: 'Validation error' };
      const result = await workflowErrorHandler.handleError(rpcError, WORKFLOW_STEPS.CREATE_ADMIN);

      expect(result.type).toBe('rpc');
      expect(result.step).toBe(WORKFLOW_STEPS.CREATE_ADMIN);
      expect(result.message).toBe('Validation error');
    });

    test('should categorize RLS errors correctly', async () => {
      const rlsError = { code: 'PGRST303', message: 'Policy violation' };
      const result = await workflowErrorHandler.handleError(rlsError, WORKFLOW_STEPS.CREATE_ORGANIZATION);

      expect(result.type).toBe('rls');
      expect(result.step).toBe(WORKFLOW_STEPS.CREATE_ORGANIZATION);
    });

    test('should categorize auth errors correctly', async () => {
      const authError = { code: 'PGRST304', message: 'Permission denied' };
      const result = await workflowErrorHandler.handleError(authError, WORKFLOW_STEPS.SMS_VALIDATION);

      expect(result.type).toBe('auth');
      expect(result.step).toBe(WORKFLOW_STEPS.SMS_VALIDATION);
    });

    test('should categorize network errors correctly', async () => {
      const networkError = { message: 'Network request failed', status: 0 };
      const result = await workflowErrorHandler.handleError(networkError, WORKFLOW_STEPS.GARAGE_SETUP);

      expect(result.type).toBe('network');
      expect(result.step).toBe(WORKFLOW_STEPS.GARAGE_SETUP);
    });

    test('should handle unknown error types', async () => {
      const unknownError = { message: 'Something went wrong' };
      const result = await workflowErrorHandler.handleError(unknownError, WORKFLOW_STEPS.SUPER_ADMIN);

      expect(result.type).toBe('rpc');
      expect(result.message).toBe('Something went wrong');
    });
  });

  describe('Error Message Extraction', () => {
    test('should extract message from error object', async () => {
      const error = { message: 'Custom error message' };
      const result = await workflowErrorHandler.handleError(error, WORKFLOW_STEPS.PRICING);

      expect(result.message).toBe('Custom error message');
    });

    test('should extract message from error_description', async () => {
      const error = { error_description: 'Description error' };
      const result = await workflowErrorHandler.handleError(error, WORKFLOW_STEPS.CREATE_ADMIN);

      expect(result.message).toBe('Description error');
    });

    test('should extract message from details', async () => {
      const error = { details: 'Detail error' };
      const result = await workflowErrorHandler.handleError(error, WORKFLOW_STEPS.CREATE_ORGANIZATION);

      expect(result.message).toBe('Detail error');
    });

    test('should extract message from hint', async () => {
      const error = { hint: 'Hint error' };
      const result = await workflowErrorHandler.handleError(error, WORKFLOW_STEPS.SMS_VALIDATION);

      expect(result.message).toBe('Hint error');
    });

    test('should handle string errors', async () => {
      const error = 'String error message';
      const result = await workflowErrorHandler.handleError(error, WORKFLOW_STEPS.GARAGE_SETUP);

      expect(result.message).toBe('String error message');
    });

    test('should provide fallback for unknown errors', async () => {
      const error = {};
      const result = await workflowErrorHandler.handleError(error, WORKFLOW_STEPS.SUPER_ADMIN);

      expect(result.message).toBe('Erreur inconnue');
    });
  });

  describe('Error Recovery', () => {
    test('should attempt recovery for auth errors', async () => {
      const authError = { code: 'PGRST304', message: 'Session expired' };

      // Mock successful session refresh
      const mockSupabase = require('@/integrations/supabase/client');
      mockSupabase.supabase.auth.refreshSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } },
        error: null
      });

      await workflowErrorHandler.handleError(authError, WORKFLOW_STEPS.CREATE_ADMIN, {
        retryCount: 1
      });

      // Vérifier que la récupération a été tentée
      expect(mockSupabase.supabase.auth.refreshSession).toHaveBeenCalled();
    });

    test('should attempt recovery for RLS errors', async () => {
      const rlsError = { code: 'PGRST303', message: 'Policy violation' };

      // Mock successful user verification
      const mockSupabase = require('@/integrations/supabase/client');
      mockSupabase.supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });

      await workflowErrorHandler.handleError(rlsError, WORKFLOW_STEPS.CREATE_ORGANIZATION, {
        retryCount: 1
      });

      // Vérifier que la vérification utilisateur a été tentée
      expect(mockSupabase.supabase.auth.getUser).toHaveBeenCalled();
    });

    test('should attempt recovery for network errors', async () => {
      const networkError = { message: 'Network failure' };

      // Mock successful health check
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200
        })
      ) as jest.Mock;

      await workflowErrorHandler.handleError(networkError, WORKFLOW_STEPS.SMS_VALIDATION, {
        retryCount: 1
      });

      // Vérifier que la vérification de connectivité a été tentée
      expect(global.fetch).toHaveBeenCalledWith('/api/health', expect.any(Object));
    });

    test('should respect retry count limits', async () => {
      const error = { message: 'Test error' };

      await workflowErrorHandler.handleError(error, WORKFLOW_STEPS.GARAGE_SETUP, {
        retryCount: 2
      });

      const stats = getWorkflowErrorStats();
      const stepErrors = stats.byStep[WORKFLOW_STEPS.GARAGE_SETUP];

      // Vérifier que le nombre de tentatives respecte la limite
      expect(stepErrors).toBeLessThanOrEqual(2);
    });

    test('should execute fallback action after max retries', async () => {
      const error = { message: 'Persistent error' };
      const fallbackAction = jest.fn();

      await workflowErrorHandler.handleError(error, WORKFLOW_STEPS.SUPER_ADMIN, {
        retryCount: 1,
        fallbackAction
      });

      // Vérifier que l'action de fallback a été exécutée
      expect(fallbackAction).toHaveBeenCalled();
    });
  });

  describe('Error Statistics', () => {
    test('should track error counts by type', async () => {
      const errors = [
        { message: 'RPC error', code: 'PGRST301' },
        { message: 'RLS error', code: 'PGRST303' },
        { message: 'Auth error', code: 'PGRST304' },
        { message: 'Network error', status: 0 }
      ];

      for (let i = 0; i < errors.length; i++) {
        await workflowErrorHandler.handleError(errors[i], WORKFLOW_STEPS.CREATE_ADMIN);
      }

      const stats = getWorkflowErrorStats();

      expect(stats.total).toBe(4);
      expect(stats.byType.rpc).toBe(2); // PGRST301 + default
      expect(stats.byType.rls).toBe(1);
      expect(stats.byType.auth).toBe(1);
      expect(stats.byType.network).toBe(1);
    });

    test('should track error counts by step', async () => {
      const steps = [
        WORKFLOW_STEPS.SUPER_ADMIN,
        WORKFLOW_STEPS.CREATE_ADMIN,
        WORKFLOW_STEPS.CREATE_ORGANIZATION
      ];

      for (const step of steps) {
        await workflowErrorHandler.handleError({ message: 'Test error' }, step);
      }

      const stats = getWorkflowErrorStats();

      expect(stats.total).toBe(3);
      expect(stats.byStep[WORKFLOW_STEPS.SUPER_ADMIN]).toBe(1);
      expect(stats.byStep[WORKFLOW_STEPS.CREATE_ADMIN]).toBe(1);
      expect(stats.byStep[WORKFLOW_STEPS.CREATE_ORGANIZATION]).toBe(1);
    });

    test('should provide recent errors', async () => {
      const errors = [
        { message: 'Error 1' },
        { message: 'Error 2' },
        { message: 'Error 3' },
        { message: 'Error 4' },
        { message: 'Error 5' }
      ];

      for (const error of errors) {
        await workflowErrorHandler.handleError(error, WORKFLOW_STEPS.CREATE_ADMIN);
      }

      const stats = getWorkflowErrorStats();

      expect(stats.recentErrors).toHaveLength(5);
      expect(stats.recentErrors[0].message).toBe('Error 1');
      expect(stats.recentErrors[4].message).toBe('Error 5');
    });
  });

  describe('Error Handler Configuration', () => {
    test('should respect showToast configuration', async () => {
      const error = { message: 'Test error' };

      await workflowErrorHandler.handleError(error, WORKFLOW_STEPS.PRICING, {
        showToast: false
      });

      // Vérifier que le toast n'a pas été affiché
      const { toast } = require('sonner');
      expect(toast.error).not.toHaveBeenCalled();
    });

    test('should respect logToConsole configuration', async () => {
      const error = { message: 'Test error' };
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await workflowErrorHandler.handleError(error, WORKFLOW_STEPS.CREATE_ADMIN, {
        logToConsole: false
      });

      // Vérifier que l'erreur n'a pas été loggée dans la console
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should respect retryDelay configuration', async () => {
      const error = { message: 'Test error' };
      const startTime = Date.now();

      await workflowErrorHandler.handleError(error, WORKFLOW_STEPS.SMS_VALIDATION, {
        retryCount: 1,
        retryDelay: 100
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Vérifier que le délai de retry a été respecté
      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Integration with Workflow Logger', () => {
    test('should log errors to workflow logger', async () => {
      const error = { message: 'Integration test error' };
      const step = WORKFLOW_STEPS.GARAGE_SETUP;

      await workflowErrorHandler.handleError(error, step);

      // Vérifier que l'erreur a été loggée
      const logs = getWorkflowLogs({ step, level: 'error' });
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toContain('Integration test error');
    });

    test('should maintain error history across sessions', async () => {
      const error = { message: 'Persistent error' };
      const step = WORKFLOW_STEPS.CREATE_ADMIN;

      await workflowErrorHandler.handleError(error, step);

      // Simuler une nouvelle session
      const newHandler = require('@/utils/errorHandlers').WorkflowErrorHandler.getInstance();

      const stats = newHandler.getErrorStats();
      expect(stats.total).toBe(1);
      expect(stats.byStep[step]).toBe(1);
    });
  });

  describe('Error Recovery Scenarios', () => {
    test('should handle cascading errors gracefully', async () => {
      const primaryError = { message: 'Primary error' };
      const recoveryError = { message: 'Recovery failed' };

      // Mock une récupération qui échoue
      const mockSupabase = require('@/integrations/supabase/client');
      mockSupabase.supabase.auth.refreshSession.mockRejectedValue(recoveryError);

      await workflowErrorHandler.handleError(primaryError, WORKFLOW_STEPS.CREATE_ADMIN, {
        retryCount: 1
      });

      const stats = getWorkflowErrorStats();
      expect(stats.total).toBeGreaterThan(1);
    });

    test('should handle timeout errors', async () => {
      const timeoutError = { message: 'Request timeout', code: 'TIMEOUT' };

      // Mock un timeout
      jest.useFakeTimers();

      const errorPromise = workflowErrorHandler.handleError(timeoutError, WORKFLOW_STEPS.SMS_VALIDATION, {
        retryCount: 1,
        retryDelay: 1000
      });

      jest.advanceTimersByTime(1000);

      const result = await errorPromise;
      expect(result.type).toBe('rpc');

      jest.useRealTimers();
    });

    test('should handle concurrent error handling', async () => {
      const errors = [
        { message: 'Error 1' },
        { message: 'Error 2' },
        { message: 'Error 3' }
      ];

      const promises = errors.map(error =>
        workflowErrorHandler.handleError(error, WORKFLOW_STEPS.CREATE_ADMIN)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(result => result.type === 'rpc')).toBe(true);

      const stats = getWorkflowErrorStats();
      expect(stats.total).toBe(3);
    });
  });
});
