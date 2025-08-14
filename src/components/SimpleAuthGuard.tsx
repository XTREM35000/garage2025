import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Loader2 } from 'lucide-react';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const SimpleAuthGuard: React.FC<SimpleAuthGuardProps> = ({
  children,
  requireAuth = true
}) => {
  const { isAuthenticated, isLoading } = useSimpleAuth();

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
    return <Navigate to="/auth" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default SimpleAuthGuard;