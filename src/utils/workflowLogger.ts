import { WorkflowStep, WorkflowTransition, WorkflowLog } from '@/types/workflow';

// Niveaux de log
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Interface pour la configuration du logger
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableLocalStorage: boolean;
  enableRemoteLogging: boolean;
  maxLogEntries: number;
  flushInterval: number; // en millisecondes
}

// Configuration par défaut
const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableLocalStorage: true,
  enableRemoteLogging: process.env.NODE_ENV === 'production',
  maxLogEntries: 1000,
  flushInterval: 30000 // 30 secondes
};

// Interface pour un message de log
export interface LogMessage {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: 'workflow' | 'auth' | 'rpc' | 'ui' | 'system';
  message: string;
  step?: WorkflowStep;
  userId?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
}

// Interface pour les métriques de performance
export interface PerformanceMetrics {
  stepDuration: Record<WorkflowStep, number[]>;
  transitionCount: Record<string, number>;
  errorRate: Record<WorkflowStep, number>;
  averageStepTime: Record<WorkflowStep, number>;
  totalWorkflowTime: number;
}

// Classe principale du logger
export class WorkflowLogger {
  private static instance: WorkflowLogger;
  private config: LoggerConfig;
  private logs: LogMessage[] = [];
  private transitions: WorkflowTransition[] = [];
  private performanceMetrics: PerformanceMetrics;
  private sessionId: string;
  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.performanceMetrics = this.initializePerformanceMetrics();
    this.initializeLogger();
  }

  static getInstance(config?: Partial<LoggerConfig>): WorkflowLogger {
    if (!WorkflowLogger.instance) {
      WorkflowLogger.instance = new WorkflowLogger(config);
    }
    return WorkflowLogger.instance;
  }

  // Initialiser le logger
  private initializeLogger(): void {
    if (this.isInitialized) return;

    // Charger les logs existants depuis le localStorage
    if (this.config.enableLocalStorage) {
      this.loadLogsFromStorage();
    }

    // Démarrer le timer de flush
    this.startFlushTimer();

    // Logger l'initialisation
    this.info('Logger workflow initialisé', 'system', {
      config: this.config,
      sessionId: this.sessionId
    });

    this.isInitialized = true;
  }

  // Générer un ID de session unique
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialiser les métriques de performance
  private initializePerformanceMetrics(): PerformanceMetrics {
    const steps: WorkflowStep[] = [
      'super-admin', 'pricing', 'create-admin', 'create-organization', 
      'sms-validation', 'garage-setup', 'complete'
    ];

    const metrics: PerformanceMetrics = {
      stepDuration: {} as Record<WorkflowStep, number[]>,
      transitionCount: {},
      errorRate: {} as Record<WorkflowStep, number>,
      averageStepTime: {} as Record<WorkflowStep, number>,
      totalWorkflowTime: 0
    };

    steps.forEach(step => {
      metrics.stepDuration[step] = [];
      metrics.errorRate[step] = 0;
      metrics.averageStepTime[step] = 0;
    });

    return metrics;
  }

  // Logger un message
  log(
    level: LogLevel,
    message: string,
    category: LogMessage['category'],
    metadata?: Record<string, any>,
    step?: WorkflowStep,
    userId?: string
  ): void {
    // Vérifier le niveau de log
    if (this.shouldLog(level)) {
      const logMessage: LogMessage = {
        id: this.generateLogId(),
        timestamp: new Date(),
        level,
        category,
        message,
        step,
        userId,
        metadata,
        sessionId: this.sessionId
      };

      // Ajouter aux logs
      this.logs.push(logMessage);

      // Maintenir la limite de logs
      if (this.logs.length > this.config.maxLogEntries) {
        this.logs = this.logs.slice(-this.config.maxLogEntries);
      }

      // Afficher dans la console
      if (this.config.enableConsole) {
        this.logToConsole(logMessage);
      }

      // Sauvegarder dans le localStorage
      if (this.config.enableLocalStorage) {
        this.saveLogsToStorage();
      }
    }
  }

  // Méthodes de log par niveau
  debug(message: string, category: LogMessage['category'] = 'workflow', metadata?: Record<string, any>, step?: WorkflowStep, userId?: string): void {
    this.log(LogLevel.DEBUG, message, category, metadata, step, userId);
  }

  info(message: string, category: LogMessage['category'] = 'workflow', metadata?: Record<string, any>, step?: WorkflowStep, userId?: string): void {
    this.log(LogLevel.INFO, message, category, metadata, step, userId);
  }

  warn(message: string, category: LogMessage['category'] = 'workflow', metadata?: Record<string, any>, step?: WorkflowStep, userId?: string): void {
    this.log(LogLevel.WARN, message, category, metadata, step, userId);
  }

  error(message: string, category: LogMessage['category'] = 'workflow', metadata?: Record<string, any>, step?: WorkflowStep, userId?: string): void {
    this.log(LogLevel.ERROR, message, category, metadata, step, userId);
  }

  // Logger une transition de workflow
  logTransition(transition: WorkflowTransition, userId?: string): void {
    this.transitions.push(transition);
    
    // Mettre à jour les métriques
    this.updateTransitionMetrics(transition);
    
    // Logger la transition
    this.info(
      `Transition: ${transition.from} → ${transition.to}`,
      'workflow',
      {
        success: transition.success,
        error: transition.error,
        duration: this.calculateTransitionDuration(transition)
      },
      transition.from,
      userId
    );

    // Mettre à jour les métriques de performance
    this.updatePerformanceMetrics(transition);
  }

  // Logger le début d'une étape
  logStepStart(step: WorkflowStep, userId?: string): void {
    this.info(`Début de l'étape: ${step}`, 'workflow', {
      stepStartTime: Date.now()
    }, step, userId);
  }

  // Logger la fin d'une étape
  logStepEnd(step: WorkflowStep, duration: number, userId?: string): void {
    this.info(`Fin de l'étape: ${step}`, 'workflow', {
      stepEndTime: Date.now(),
      duration,
      success: true
    }, step, userId);

    // Mettre à jour les métriques de durée
    this.performanceMetrics.stepDuration[step].push(duration);
    this.performanceMetrics.averageStepTime[step] = 
      this.performanceMetrics.stepDuration[step].reduce((a, b) => a + b, 0) / 
      this.performanceMetrics.stepDuration[step].length;
  }

  // Logger une erreur d'étape
  logStepError(step: WorkflowStep, error: any, userId?: string): void {
    this.error(`Erreur dans l'étape: ${step}`, 'workflow', {
      error: error?.message || error,
      errorType: error?.constructor?.name,
      stack: error?.stack
    }, step, userId);

    // Mettre à jour le taux d'erreur
    this.performanceMetrics.errorRate[step]++;
  }

  // Vérifier si le message doit être loggé
  private shouldLog(level: LogLevel): boolean {
    const levelOrder = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const configLevelIndex = levelOrder.indexOf(this.config.level);
    const messageLevelIndex = levelOrder.indexOf(level);
    
    return messageLevelIndex >= configLevelIndex;
  }

  // Générer un ID unique pour le log
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Logger dans la console
  private logToConsole(logMessage: LogMessage): void {
    const timestamp = logMessage.timestamp.toISOString();
    let prefix = `[${timestamp}] [${logMessage.level.toUpperCase()}] [${logMessage.category}]`;
    
    if (logMessage.step) {
      prefix += ` [${logMessage.step}]`;
    }

    const consoleMethod = logMessage.level === 'error' ? 'error' : 
                         logMessage.level === 'warn' ? 'warn' : 
                         logMessage.level === 'debug' ? 'debug' : 'log';

    console[consoleMethod](`${prefix}: ${logMessage.message}`, logMessage.metadata || '');
  }

  // Sauvegarder les logs dans le localStorage
  private saveLogsToStorage(): void {
    try {
      const logsToSave = this.logs.slice(-100); // Garder seulement les 100 derniers
      localStorage.setItem('workflow_logs', JSON.stringify(logsToSave));
      localStorage.setItem('workflow_transitions', JSON.stringify(this.transitions.slice(-50)));
    } catch (error) {
      console.warn('Impossible de sauvegarder les logs dans le localStorage:', error);
    }
  }

  // Charger les logs depuis le localStorage
  private loadLogsFromStorage(): void {
    try {
      const savedLogs = localStorage.getItem('workflow_logs');
      const savedTransitions = localStorage.getItem('workflow_transitions');
      
      if (savedLogs) {
        const parsedLogs = JSON.parse(savedLogs);
        this.logs = parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
      
      if (savedTransitions) {
        this.transitions = JSON.parse(savedTransitions).map((transition: any) => ({
          ...transition,
          timestamp: new Date(transition.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Impossible de charger les logs depuis le localStorage:', error);
    }
  }

  // Mettre à jour les métriques de transition
  private updateTransitionMetrics(transition: WorkflowTransition): void {
    const transitionKey = `${transition.from}→${transition.to}`;
    this.performanceMetrics.transitionCount[transitionKey] = 
      (this.performanceMetrics.transitionCount[transitionKey] || 0) + 1;
  }

  // Calculer la durée d'une transition
  private calculateTransitionDuration(transition: WorkflowTransition): number {
    // Pour l'instant, on retourne 0 car on n'a pas le timestamp de début
    // En production, on pourrait stocker les timestamps de début d'étape
    return 0;
  }

  // Mettre à jour les métriques de performance
  private updatePerformanceMetrics(transition: WorkflowTransition): void {
    // Calculer le temps total du workflow
    if (transition.to === 'complete') {
      const firstTransition = this.transitions[0];
      if (firstTransition) {
        this.performanceMetrics.totalWorkflowTime = 
          transition.timestamp.getTime() - firstTransition.timestamp.getTime();
      }
    }
  }

  // Démarrer le timer de flush
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.config.flushInterval);
  }

  // Flusher les logs (envoi vers un service externe)
  private async flushLogs(): Promise<void> {
    if (!this.config.enableRemoteLogging || this.logs.length === 0) return;

    try {
      // Envoyer les logs vers un service externe
      await this.sendLogsToRemoteService();
      
      // Nettoyer les logs envoyés
      this.logs = [];
      this.transitions = [];
      
      this.info('Logs flushés avec succès', 'system');
    } catch (error) {
      this.error('Erreur lors du flush des logs', 'system', { error });
    }
  }

  // Envoyer les logs vers un service externe
  private async sendLogsToRemoteService(): Promise<void> {
    // Implémentation pour envoyer vers un service comme LogRocket, Sentry, etc.
    const payload = {
      sessionId: this.sessionId,
      logs: this.logs,
      transitions: this.transitions,
      performanceMetrics: this.performanceMetrics,
      timestamp: new Date().toISOString()
    };

    // Exemple avec fetch (à adapter selon votre service)
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Erreur d'envoi des logs: ${error}`);
    }
  }

  // Obtenir les logs filtrés
  getLogs(filters?: {
    level?: LogLevel;
    category?: LogMessage['category'];
    step?: WorkflowStep;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): LogMessage[] {
    let filteredLogs = [...this.logs];

    if (filters?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    if (filters?.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category);
    }

    if (filters?.step) {
      filteredLogs = filteredLogs.filter(log => log.step === filters.step);
    }

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters?.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }

    return filteredLogs;
  }

  // Obtenir les métriques de performance
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  // Obtenir les statistiques des transitions
  getTransitionStats(): {
    total: number;
    byTransition: Record<string, number>;
    successRate: number;
    averageTime: number;
  } {
    const total = this.transitions.length;
    const successful = this.transitions.filter(t => t.success).length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      total,
      byTransition: { ...this.performanceMetrics.transitionCount },
      successRate,
      averageTime: this.performanceMetrics.totalWorkflowTime / total || 0
    };
  }

  // Nettoyer les logs
  clearLogs(): void {
    this.logs = [];
    this.transitions = [];
    this.performanceMetrics = this.initializePerformanceMetrics();
    
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('workflow_logs');
      localStorage.removeItem('workflow_transitions');
    }

    this.info('Logs nettoyés', 'system');
  }

  // Exporter les logs
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const data = {
      logs: this.logs,
      transitions: this.transitions,
      performanceMetrics: this.performanceMetrics,
      exportDate: new Date().toISOString()
    };

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return JSON.stringify(data, null, 2);
  }

  // Convertir en CSV
  private convertToCSV(data: any): string {
    // Implémentation basique de conversion CSV
    const logs = data.logs;
    if (logs.length === 0) return '';

    const headers = Object.keys(logs[0]);
    const csvRows = [headers.join(',')];

    for (const log of logs) {
      const values = headers.map(header => {
        const value = log[header];
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  // Détruire le logger
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushLogs();
    this.isInitialized = false;
  }
}

// Export de l'instance singleton
export const workflowLogger = WorkflowLogger.getInstance();

// Fonctions utilitaires
export const logWorkflowInfo = (message: string, step?: WorkflowStep, metadata?: Record<string, any>) => {
  workflowLogger.info(message, 'workflow', metadata, step);
};

export const logWorkflowError = (message: string, step?: WorkflowStep, error?: any) => {
  workflowLogger.error(message, 'workflow', { error }, step);
};

export const logWorkflowTransition = (transition: WorkflowTransition, userId?: string) => {
  workflowLogger.logTransition(transition, userId);
};

export const getWorkflowLogs = (filters?: Parameters<typeof workflowLogger.getLogs>[0]) => {
  return workflowLogger.getLogs(filters);
};

export const getWorkflowMetrics = () => workflowLogger.getPerformanceMetrics();
