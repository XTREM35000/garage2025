import React from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import UnifiedHeader from '@/components/UnifiedHeader';
import UnifiedFooter from '@/components/UnifiedFooter';

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true
}) => {
  const { isAuthenticated } = useSimpleAuth();

  // Pages qui ne doivent pas avoir de header/footer
  const isSpecialPage = window.location.pathname === '/' ||
                       window.location.pathname.includes('/auth') ||
                       window.location.pathname.includes('/setup');

  if (isSpecialPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header unique - seulement si authentifié */}
      {showHeader && isAuthenticated && (
        <UnifiedHeader />
      )}
      
      {/* Contenu principal */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="min-h-[calc(100vh-140px)]">
            {children}
          </div>
        </div>
      </main>

      {/* Footer unique - seulement si authentifié */}
      {showFooter && isAuthenticated && (
        <UnifiedFooter />
      )}
    </div>
  );
};

export default AppLayout;