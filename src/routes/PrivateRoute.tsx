import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Vérifier l'authentification avec les données utilisateur
  const user = localStorage.getItem('user');
  const garageData = localStorage.getItem('garageData');
  const isAuthenticated = Boolean(user && garageData);

  // Log pour debug
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated);
  console.log('PrivateRoute - user:', user);
  console.log('PrivateRoute - garageData:', garageData);

  if (!isAuthenticated) {
    console.log('PrivateRoute - Redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
