import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Loader2, Shield, AlertCircle } from 'lucide-react';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const SimpleAuthGuard: React.FC<SimpleAuthGuardProps> = ({
  children,
  requireAuth = true
}) => {
  const { isAuthenticated, isLoading } = useSimpleAuth();
  const navigate = useNavigate();
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  // Éviter les boucles infinies de redirection
  useEffect(() => {
    if (redirectAttempts > 3) {
      console.error('Too many redirect attempts in SimpleAuthGuard, stopping to prevent infinite loop');
      return;
    }
  }, [redirectAttempts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">
              Vérification...
            </h3>
            <p className="text-slate-600 text-sm">
              Chargement de votre session
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    // Incrémenter le compteur de tentatives
    setRedirectAttempts(prev => prev + 1);

    // Afficher un message d'erreur si trop de tentatives
    if (redirectAttempts > 2) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-red-800">
                Erreur d'authentification
              </h2>
              <p className="text-red-600 max-w-md">
                Trop de tentatives de redirection détectées.
                Veuillez rafraîchir la page ou vous connecter manuellement.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Rafraîchir la page
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <Navigate to="/auth" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default SimpleAuthGuard;