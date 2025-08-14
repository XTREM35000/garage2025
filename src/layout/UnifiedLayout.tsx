import React from 'react';
import { Outlet } from 'react-router-dom';
import UnifiedHeader from '@/components/UnifiedHeader';
import UnifiedFooter from '@/components/UnifiedFooter';
import PageNavigation from '@/components/PageNavigation';

interface UnifiedLayoutProps {
  children?: React.ReactNode;
}

const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-all duration-300">
      {/* Header fixe en haut */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <UnifiedHeader showUserMenu={true} showThemeToggle={true} />
      </header>
      {/* Spacer pour compenser la hauteur du header et éviter l'écrasement */}
      <div style={{ height: 72 }} />

      {/* Navigation avec animations */}
      <div className="bg-card/50 border-b border-border/30">
        <PageNavigation />
      </div>

      {/* Contenu principal avec transitions fluides */}
      <main className="flex-1 relative overflow-hidden">
        <div className="container mx-auto px-4 py-3 space-y-4 animate-fade-in">
          {children || <Outlet />}
        </div>
      </main>

      {/* Footer avec design amélioré */}
      <footer className="mt-auto bg-card/30 border-t border-border/50">
        <UnifiedFooter />
      </footer>
    </div>
  );
};

export default UnifiedLayout;