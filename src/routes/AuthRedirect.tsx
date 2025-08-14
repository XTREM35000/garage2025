import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface AuthRedirectProps {
  children: React.ReactNode;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  // Vérifier si l'utilisateur est déjà connecté
  const user = localStorage.getItem('user');
  const garageData = localStorage.getItem('garageData');
  const isAuthenticated = Boolean(user && garageData);

  // Si l'utilisateur est connecté, rediriger vers le dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Sinon, afficher le composant enfant (page de connexion)
  return <>{children}</>;
};

export default AuthRedirect;
