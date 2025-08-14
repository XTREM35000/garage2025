import React from 'react';
import { Loader2, Zap, RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dots' | 'pulse' | 'spin';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`bg-primary rounded-full ${size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : 'h-3 w-3'}`}
                style={{
                  animation: `pulse-gentle 1.4s ease-in-out ${i * 0.16}s infinite both`
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <Zap className={`${sizeClasses[size]} text-primary animate-pulse-gentle`} />
        );
      
      case 'spin':
        return (
          <RefreshCw className={`${sizeClasses[size]} text-primary animate-spin`} />
        );
      
      default:
        return (
          <Loader2 className={`${sizeClasses[size]} text-primary animate-spin`} />
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {renderSpinner()}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse-gentle">
          {text}
        </p>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  variant?: 'default' | 'blur';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  text = 'Chargement...',
  variant = 'default'
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${variant === 'blur' ? 'bg-background/80 backdrop-blur-sm' : 'bg-background/90'}
        transition-all duration-300 ease-in-out
      `}
    >
      <div className="bg-card/95 backdrop-blur-sm rounded-lg p-6 shadow-lg border">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

export const LoadingPage: React.FC<{ text?: string }> = ({ 
  text = 'Chargement de la page...' 
}) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);