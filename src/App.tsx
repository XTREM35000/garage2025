import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WorkflowProvider } from '@/contexts/WorkflowContext';
import SplashScreen from '@/components/SplashScreen';

// Pages
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import ClientsListe from '@/pages/ClientsListe';
import ClientsAjouter from '@/pages/ClientsAjouter';
import ClientsHistorique from '@/pages/ClientsHistorique';
import Vehicules from '@/pages/Vehicules';
import Reparations from '@/pages/Reparations';
import Stock from '@/pages/Stock';
import Settings from '@/pages/Settings';
import Profil from '@/pages/Profil';
import Personnel from '@/pages/Personnel';
import Aide from '@/pages/Aide';
import APropos from '@/pages/APropos';
import NotFound from '@/pages/NotFound';

// Composants
import WorkflowGuardV2 from '@/components/WorkflowGuardV2';
import FirstLaunchGuard from '@/components/FirstLaunchGuard';
import SimpleAuthGuard from '@/components/SimpleAuthGuard';
import PostAuthHandler from '@/components/PostAuthHandler';
import ErrorBoundary from '@/components/ErrorBoundary';
import { PageTransition } from '@/components/ui/page-transition';
import UnifiedLayout from '@/layout/UnifiedLayout';
import UserMenuDebug from '@/components/UserMenuDebug';

// Styles
import './App.css';

// Composant wrapper pour les routes protégées avec le nouveau système de workflow
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FirstLaunchGuard>
    <SimpleAuthGuard>
      <PostAuthHandler>
        <UnifiedLayout>
          <PageTransition>
            {children}
          </PageTransition>
        </UnifiedLayout>
      </PostAuthHandler>
    </SimpleAuthGuard>
  </FirstLaunchGuard>
);

const App: React.FC = () => {
  const [appLoaded, setAppLoaded] = useState(false);

  useEffect(() => {
    // Simuler le temps de chargement initial
    const timer = setTimeout(() => {
      setAppLoaded(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SplashScreen visible={!appLoaded} />
      {appLoaded && (
        <ErrorBoundary>
          <ThemeProvider>
            <WorkflowProvider>
              <BrowserRouter>
                <div className="min-h-screen bg-background text-foreground">
                  <Routes>
                    {/* Route racine - gestion du workflow */}
                    <Route
                      path="/"
                      element={
                        <FirstLaunchGuard>
                          <div className="min-h-screen bg-background">
                            {/* Le FirstLaunchGuard gère l'affichage du workflow ou du dashboard */}
                          </div>
                        </FirstLaunchGuard>
                      }
                    />

                    {/* Page d'authentification */}
                    <Route
                      path="/auth"
                      element={
                        <PageTransition>
                          <Auth />
                        </PageTransition>
                      }
                    />

                    {/* Routes protégées avec layout unifié */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                    {/* Gestion des clients */}
                    <Route path="/clients" element={<ProtectedRoute><ClientsListe /></ProtectedRoute>} />
                    <Route path="/clients/liste" element={<ProtectedRoute><ClientsListe /></ProtectedRoute>} />
                    <Route path="/clients/ajouter" element={<ProtectedRoute><ClientsAjouter /></ProtectedRoute>} />
                    <Route path="/clients/historique" element={<ProtectedRoute><ClientsHistorique /></ProtectedRoute>} />

                    {/* Gestion des véhicules */}
                    <Route path="/vehicules" element={<ProtectedRoute><Vehicules /></ProtectedRoute>} />

                    {/* Gestion des réparations */}
                    <Route path="/reparations" element={<ProtectedRoute><Reparations /></ProtectedRoute>} />

                    {/* Gestion du stock */}
                    <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />

                    {/* Gestion du personnel */}
                    <Route path="/personnel" element={<ProtectedRoute><Personnel /></ProtectedRoute>} />

                    {/* Profil utilisateur */}
                    <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />

                    {/* Paramètres */}
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                    {/* Aide et informations */}
                    <Route path="/aide" element={<ProtectedRoute><Aide /></ProtectedRoute>} />
                    <Route path="/a-propos" element={<ProtectedRoute><APropos /></ProtectedRoute>} />

                    {/* Route de debug (développement uniquement) */}
                    {process.env.NODE_ENV === 'development' && (
                      <Route path="/debug" element={<ProtectedRoute><UserMenuDebug /></ProtectedRoute>} />
                    )}

                    {/* Route 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>

                  {/* Toaster pour les notifications */}
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    duration={4000}
                  />
                </div>
              </BrowserRouter>
            </WorkflowProvider>
          </ThemeProvider>
        </ErrorBoundary>
      )}
    </>
  );
};

export default App;