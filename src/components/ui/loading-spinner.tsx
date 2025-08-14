import React from 'react';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Chargement...',
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative">
        {/* Roue qui tourne */}
        <div className={cn(
          'animate-spin rounded-full border-4 border-gray-200 border-t-green-600',
          sizeClasses[size]
        )} />

        {/* Logo garage au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Car className={cn(
            'text-green-600',
            size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
          )} />
        </div>
      </div>

      {text && (
        <p className={cn(
          'mt-4 text-gray-600 font-medium',
          textSizes[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

// Spinner pour les boutons
export const ButtonSpinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-white border-t-transparent',
      size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    )} />
  );
};

// Spinner pour les tableaux
export const TableSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" text="Chargement des données..." />
    </div>
  );
};

// Spinner pour les modales
export const ModalSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text="Traitement en cours..." />
    </div>
  );
};
