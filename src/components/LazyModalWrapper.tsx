import React, { Suspense, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface LazyModalWrapperProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  loadingMessage?: string;
}

const LazyModalWrapper: React.FC<LazyModalWrapperProps> = memo(({
  isOpen,
  onOpenChange,
  children,
  className = "sm:max-w-4xl",
  loadingMessage = "Chargement..."
}) => {
  const LoadingFallback = () => (
    <DialogContent className={`${className} flex flex-col items-center justify-center p-8`}>
      <DialogHeader className="sr-only">
        <DialogTitle>Chargement</DialogTitle>
        <DialogDescription>Veuillez patienter pendant le chargement du contenu</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {loadingMessage}
        </p>
      </div>
    </DialogContent>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </Dialog>
  );
});

LazyModalWrapper.displayName = 'LazyModalWrapper';

export default LazyModalWrapper;