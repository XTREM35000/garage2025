import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';

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
import WorkflowGuard from '@/components/WorkflowGuard';
import SimpleAuthGuard from '@/components/SimpleAuthGuard';
import PostAuthHandler from '@/components/PostAuthHandler';
import ErrorBoundary from '@/components/ErrorBoundary';
import { PageTransition } from '@/components/ui/page-transition';
import UnifiedLayout from '@/layout/UnifiedLayout';
import UserMenuDebug from '@/components/UserMenuDebug';

// Styles
import './App.css';

// Composant wrapper pour les routes protégées
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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              {/* Route racine - redirection intelligente */}
              <Route
                path="/"
                element={
                  <WorkflowGuard>
                    <Navigate to="/dashboard" replace />
                  </WorkflowGuard>
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

              {/* Pages d'aide et information */}
              <Route path="/aide" element={<ProtectedRoute><Aide /></ProtectedRoute>} />
              <Route path="/a-propos" element={<ProtectedRoute><APropos /></ProtectedRoute>} />

              {/* Debug */}
              <Route path="/debug" element={<ProtectedRoute><UserMenuDebug /></ProtectedRoute>} />

              {/* Route 404 */}
              <Route
                path="*"
                element={
                  <PageTransition>
                    <NotFound />
                  </PageTransition>
                }
              />
            </Routes>

            {/* Toast amélioré pour les notifications */}
            <Toaster
              position="top-right"
              expand={false}
              richColors
              duration={5000}  // Durée en ms avant disparition
              pauseWhenPageIsHidden
              closeButton
              theme="light"
              visibleToasts={3}
              toastOptions={{
                style: {
                  background: 'white',
                  color: 'black',
                },
                className: 'my-toast-class',
              }}
            />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;