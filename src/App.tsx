import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Pages
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import ClientsListe from '@/pages/ClientsListe';
import NotFound from '@/pages/NotFound'; // Import ajouté
// ... autres imports de pages

// Composants
import SplashScreen from '@/components/SplashScreen';
import PricingModal from '@/components/PricingModal';
import WorkflowGuard from '@/components/WorkflowGuard';
import SimpleAuthGuard from '@/components/SimpleAuthGuard';
import PostAuthHandler from '@/components/PostAuthHandler';
import ErrorBoundary from '@/components/ErrorBoundary';
import { PageTransition } from '@/components/ui/page-transition';
import UnifiedLayout from '@/layout/UnifiedLayout';

// Wrapper pour routes protégées
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WorkflowGuard>
    <SimpleAuthGuard>
      <PostAuthHandler>
        <UnifiedLayout>
          <PageTransition>
            {children}
          </PageTransition>
        </UnifiedLayout>
      </PostAuthHandler>
    </SimpleAuthGuard>
  </WorkflowGuard>
);

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handlePlanSelect = async (planId: string) => {
    // Implémentation correcte qui retourne une Promise<void>
    return new Promise<void>((resolve) => {
      window.location.href = '/auth';
      resolve();
    });
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };


  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }


  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              {/* Nouveau flux pricing */}
              <Route path="/" element={
                <div className="p-4">
                  <PricingModal
                    isOpen={true}
                    onSelectPlan={handlePlanSelect}
                  />
                </div>
              } />

              {/* Auth */}
              <Route path="/auth" element={
                <PageTransition>
                  <Auth />
                </PageTransition>
              } />

              {/* Routes protégées */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/clients" element={<ProtectedRoute><ClientsListe /></ProtectedRoute>} />
              {/* ... autres routes */}

              {/* Route 404 */}
              <Route path="*" element={
                <PageTransition>
                  <NotFound />
                </PageTransition>
              } />
            </Routes>

            <Toaster position="top-right" richColors />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;