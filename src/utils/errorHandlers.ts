import { toast } from 'sonner';
import { WorkflowError, WorkflowStep } from '@/types/workflow';

// Types d'erreurs spécifiques
export enum ErrorType {
  RPC_ERROR = 'rpc',
  AUTH_ERROR = 'auth',
  RLS_ERROR = 'rls',
  NETWORK_ERROR = 'network',
  VALIDATION_ERROR = 'validation',
  TIMEOUT_ERROR = 'timeout'
}

// Codes d'erreur Supabase courants
export const SUPABASE_ERROR_CODES = {
  PGRST116: 'Aucun résultat trouvé',
  PGRST301: 'Erreur de validation',
  PGRST302: 'Erreur de contrainte',
  PGRST303: 'Erreur de politique RLS',
  PGRST304: 'Erreur de permission',
  PGRST305: 'Erreur de transaction',
  PGRST306: 'Erreur de connexion',
  PGRST307: 'Erreur de timeout'
} as const;

// Interface pour la gestion des erreurs
export interface ErrorHandlerConfig {
  showToast?: boolean;
  logToConsole?: boolean;
  retryCount?: number;
  retryDelay?: number;
  fallbackAction?: () => void;
}

// Configuration par défaut
const DEFAULT_ERROR_CONFIG: ErrorHandlerConfig = {
  showToast: true,
  logToConsole: true,
  retryCount: 3,
  retryDelay: 1000,
  fallbackAction: () => window.location.reload()
};

// Gestionnaire principal d'erreurs
export class WorkflowErrorHandler {
  private static instance: WorkflowErrorHandler;
  private errorHistory: WorkflowError[] = [];
  private retryAttempts: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): WorkflowErrorHandler {
    if (!WorkflowErrorHandler.instance) {
      WorkflowErrorHandler.instance = new WorkflowErrorHandler();
    }
    return WorkflowErrorHandler.instance;
  }

  // Gérer une erreur avec configuration personnalisée
  async handleError(
    error: any,
    step: WorkflowStep,
    config: Partial<ErrorHandlerConfig> = {}
  ): Promise<WorkflowError> {
    const finalConfig = { ...DEFAULT_ERROR_CONFIG, ...config };
    
    // Créer l'objet d'erreur workflow
    const workflowError: WorkflowError = {
      step,
      type: this.categorizeError(error),
      message: this.extractErrorMessage(error),
      timestamp: new Date(),
      details: error
    };

    // Ajouter à l'historique
    this.errorHistory.push(workflowError);

    // Logger l'erreur
    if (finalConfig.logToConsole) {
      this.logError(workflowError);
    }

    // Afficher le toast
    if (finalConfig.showToast) {
      this.showErrorToast(workflowError);
    }

    // Tenter la récupération automatique
    if (finalConfig.retryCount && finalConfig.retryCount > 0) {
      await this.attemptRecovery(workflowError, finalConfig);
    }

    return workflowError;
  }

  // Catégoriser le type d'erreur
  private categorizeError(error: any): WorkflowError['type'] {
    if (error?.code && Object.keys(SUPABASE_ERROR_CODES).includes(error.code)) {
      if (error.code === 'PGRST303') return 'rls';
      if (error.code === 'PGRST304') return 'auth';
      return 'rpc';
    }

    if (error?.status === 401 || error?.status === 403) return 'auth';
    if (error?.status === 500) return 'rpc';
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) return 'network';
    
    return 'rpc';
  }

  // Extraire le message d'erreur
  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    
    if (error?.message) return error.message;
    
    if (error?.error_description) return error.error_description;
    
    if (error?.details) return error.details;
    
    if (error?.hint) return error.hint;
    
    return 'Erreur inconnue';
  }

  // Logger l'erreur
  private logError(error: WorkflowError): void {
    const logMessage = `❌ [${error.step}] ${error.type.toUpperCase()}: ${error.message}`;
    
    if (error.type === 'auth') {
      console.warn(logMessage, error.details);
    } else if (error.type === 'rls') {
      console.error(logMessage, error.details);
    } else {
      console.error(logMessage, error.details);
    }

    // Envoyer à un service de monitoring en production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error);
    }
  }

  // Afficher le toast d'erreur
  private showErrorToast(error: WorkflowError): void {
    const getToastType = () => {
      switch (error.type) {
        case 'auth': return 'error';
        case 'rls': return 'error';
        case 'rpc': return 'error';
        case 'network': return 'warning';
        default: return 'error';
      }
    };

    const getToastMessage = () => {
      switch (error.type) {
        case 'auth':
          return 'Erreur d\'authentification. Veuillez vous reconnecter.';
        case 'rls':
          return 'Erreur de permission. Contactez votre administrateur.';
        case 'rpc':
          return 'Erreur serveur. Réessayez dans quelques instants.';
        case 'network':
          return 'Problème de connexion. Vérifiez votre internet.';
        default:
          return error.message;
      }
    };

    toast[getToastType()](getToastMessage(), {
      description: `Étape: ${error.step}`,
      duration: 5000,
      action: {
        label: 'Réessayer',
        onClick: () => this.retryAction(error)
      }
    });
  }

  // Tenter la récupération automatique
  private async attemptRecovery(
    error: WorkflowError, 
    config: ErrorHandlerConfig
  ): Promise<void> {
    const retryKey = `${error.step}-${error.type}`;
    const currentAttempts = this.retryAttempts.get(retryKey) || 0;
    
    if (currentAttempts >= (config.retryCount || 0)) {
      console.log(`🔄 [${error.step}] Nombre maximum de tentatives atteint`);
      if (config.fallbackAction) {
        config.fallbackAction();
      }
      return;
    }

    this.retryAttempts.set(retryKey, currentAttempts + 1);
    
    console.log(`🔄 [${error.step}] Tentative de récupération ${currentAttempts + 1}/${config.retryCount}`);
    
    // Attendre avant de réessayer
    await new Promise(resolve => setTimeout(resolve, config.retryDelay));
    
    // Tenter la récupération selon le type d'erreur
    try {
      switch (error.type) {
        case 'auth':
          await this.recoverFromAuthError(error);
          break;
        case 'rls':
          await this.recoverFromRLSError(error);
          break;
        case 'network':
          await this.recoverFromNetworkError(error);
          break;
        default:
          await this.recoverFromGenericError(error);
      }
    } catch (recoveryError) {
      console.error(`❌ [${error.step}] Échec de la récupération:`, recoveryError);
    }
  }

  // Récupération d'erreur d'authentification
  private async recoverFromAuthError(error: WorkflowError): Promise<void> {
    // Tenter de rafraîchir la session
    try {
      const { data: { session }, error: refreshError } = await import('@/integrations/supabase/client')
        .then(({ supabase }) => supabase.auth.refreshSession());
      
      if (session && !refreshError) {
        console.log(`✅ [${error.step}] Session rafraîchie avec succès`);
        toast.success('Session rafraîchie');
      } else {
        throw refreshError;
      }
    } catch (refreshError) {
      console.error(`❌ [${error.step}] Échec du rafraîchissement de session:`, refreshError);
      // Rediriger vers la page de connexion
      window.location.href = '/auth/login';
    }
  }

  // Récupération d'erreur RLS
  private async recoverFromRLSError(error: WorkflowError): Promise<void> {
    // Vérifier les permissions utilisateur
    try {
      const { data: { user } } = await import('@/integrations/supabase/client')
        .then(({ supabase }) => supabase.auth.getUser());
      
      if (user) {
        console.log(`✅ [${error.step}] Utilisateur vérifié:`, user.id);
        // Tenter de rafraîchir l'état du workflow
        window.location.reload();
      }
    } catch (userError) {
      console.error(`❌ [${error.step}] Échec de la vérification utilisateur:`, userError);
    }
  }

  // Récupération d'erreur réseau
  private async recoverFromNetworkError(error: WorkflowError): Promise<void> {
    // Vérifier la connectivité
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        console.log(`✅ [${error.step}] Connectivité rétablie`);
        toast.success('Connexion rétablie');
        window.location.reload();
      }
    } catch (healthError) {
      console.error(`❌ [${error.step}] Échec de la vérification de connectivité:`, healthError);
    }
  }

  // Récupération d'erreur générique
  private async recoverFromGenericError(error: WorkflowError): Promise<void> {
    // Attendre un peu plus longtemps et recharger
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`🔄 [${error.step}] Rechargement de la page`);
    window.location.reload();
  }

  // Action de retry manuel
  private retryAction(error: WorkflowError): void {
    console.log(`🔄 [${error.step}] Retry manuel demandé`);
    window.location.reload();
  }

  // Envoyer à un service de monitoring
  private sendToMonitoring(error: WorkflowError): void {
    // Implémentation pour envoyer les erreurs à un service externe
    // Ex: Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'workflow_error', {
        event_category: 'workflow',
        event_label: error.step,
        value: 1,
        custom_parameters: {
          error_type: error.type,
          error_message: error.message,
          timestamp: error.timestamp.toISOString()
        }
      });
    }
  }

  // Obtenir l'historique des erreurs
  getErrorHistory(): WorkflowError[] {
    return [...this.errorHistory];
  }

  // Nettoyer l'historique des erreurs
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.retryAttempts.clear();
  }

  // Obtenir les statistiques d'erreurs
  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    byStep: Record<string, number>;
    recentErrors: WorkflowError[];
  } {
    const byType: Record<string, number> = {};
    const byStep: Record<string, number> = {};
    
    this.errorHistory.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      byStep[error.step] = (byStep[error.step] || 0) + 1;
    });

    return {
      total: this.errorHistory.length,
      byType,
      byStep,
      recentErrors: this.errorHistory.slice(-10) // 10 dernières erreurs
    };
  }
}

// Export de l'instance singleton
export const workflowErrorHandler = WorkflowErrorHandler.getInstance();

// Fonctions utilitaires
export const handleWorkflowError = (
  error: any,
  step: WorkflowStep,
  config?: Partial<ErrorHandlerConfig>
) => workflowErrorHandler.handleError(error, step, config);

export const getWorkflowErrorStats = () => workflowErrorHandler.getErrorStats();

export const clearWorkflowErrors = () => workflowErrorHandler.clearErrorHistory();
