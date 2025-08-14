import { toast as originalToast, ExternalToast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info, Zap } from 'lucide-react';

export interface EnhancedToastOptions extends ExternalToast {
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading';
  action?: {
    label: string;
    onClick: () => void;
  };
}

class EnhancedToast {
  private getIcon(type?: string) {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'warning':
        return AlertCircle;
      case 'info':
        return Info;
      case 'loading':
        return Zap;
      default:
        return Info;
    }
  }

  private getStyles(type?: string) {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200';
      case 'loading':
        return 'bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-950 dark:border-violet-800 dark:text-violet-200';
      default:
        return 'bg-card border-border text-card-foreground';
    }
  }

  success(message: string, options?: EnhancedToastOptions) {
    const Icon = this.getIcon('success');
    return originalToast(
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div className="flex-1">
          {options?.title && (
            <div className="font-semibold text-sm">{options.title}</div>
          )}
          <div className="text-sm opacity-90">{message}</div>
        </div>
      </div>,
      {
        ...options,
        className: `${this.getStyles('success')} shadow-lg backdrop-blur-sm`,
        duration: options?.duration || 4000,
      }
    );
  }

  error(message: string, options?: EnhancedToastOptions) {
    const Icon = this.getIcon('error');
    return originalToast(
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        <div className="flex-1">
          {options?.title && (
            <div className="font-semibold text-sm">{options.title}</div>
          )}
          <div className="text-sm opacity-90">{message}</div>
        </div>
      </div>,
      {
        ...options,
        className: `${this.getStyles('error')} shadow-lg backdrop-blur-sm`,
        duration: options?.duration || 6000,
      }
    );
  }

  warning(message: string, options?: EnhancedToastOptions) {
    const Icon = this.getIcon('warning');
    return originalToast(
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="flex-1">
          {options?.title && (
            <div className="font-semibold text-sm">{options.title}</div>
          )}
          <div className="text-sm opacity-90">{message}</div>
        </div>
      </div>,
      {
        ...options,
        className: `${this.getStyles('warning')} shadow-lg backdrop-blur-sm`,
        duration: options?.duration || 5000,
      }
    );
  }

  info(message: string, options?: EnhancedToastOptions) {
    const Icon = this.getIcon('info');
    return originalToast(
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-1">
          {options?.title && (
            <div className="font-semibold text-sm">{options.title}</div>
          )}
          <div className="text-sm opacity-90">{message}</div>
        </div>
      </div>,
      {
        ...options,
        className: `${this.getStyles('info')} shadow-lg backdrop-blur-sm`,
        duration: options?.duration || 4000,
      }
    );
  }

  loading(message: string, options?: EnhancedToastOptions) {
    const Icon = this.getIcon('loading');
    return originalToast(
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0 animate-pulse" />
        <div className="flex-1">
          {options?.title && (
            <div className="font-semibold text-sm">{options.title}</div>
          )}
          <div className="text-sm opacity-90">{message}</div>
        </div>
      </div>,
      {
        ...options,
        className: `${this.getStyles('loading')} shadow-lg backdrop-blur-sm`,
        duration: options?.duration || 0, // Persistent until manually dismissed
      }
    );
  }

  custom(content: React.ReactNode, options?: ExternalToast) {
    return originalToast(content, {
      ...options,
      className: `bg-card border-border text-card-foreground shadow-lg backdrop-blur-sm ${options?.className || ''}`,
    });
  }

  promise<T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
      ...options
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    } & EnhancedToastOptions
  ) {
    return originalToast.promise(promise, {
      loading: this.renderToastContent(loading, 'loading'),
      success: (data: T) => {
        const message = typeof success === 'function' ? success(data) : success;
        return this.renderToastContent(message, 'success');
      },
      error: (error: any) => {
        const message = typeof error === 'function' ? error(error) : error;
        return this.renderToastContent(message, 'error');
      },
      ...options,
    });
  }

  private renderToastContent(message: string, type: string) {
    const Icon = this.getIcon(type);
    return (
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 ${
          type === 'loading' ? 'animate-pulse' : ''
        }`} />
        <div className="text-sm">{message}</div>
      </div>
    );
  }
}

export const toast = new EnhancedToast();