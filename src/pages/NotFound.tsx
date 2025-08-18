import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [redirectCount, setRedirectCount] = useState(0);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Éviter les boucles infinies de redirection
    if (redirectCount > 2) {
      console.error("Too many redirects, stopping to prevent infinite loop");
      return;
    }

    // Rediriger vers la page d'authentification si c'est une route d'auth inexistante
    if (location.pathname.startsWith('/auth/')) {
      setRedirectCount(prev => prev + 1);
      navigate('/auth', { replace: true });
      return;
    }

    // Rediriger vers la racine pour les autres routes inexistantes
    if (location.pathname !== '/') {
      setRedirectCount(prev => prev + 1);
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate, redirectCount]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center space-y-6">
        <div className="w-32 h-32 mx-auto bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Page non trouvée</h2>
          <p className="text-gray-600 max-w-md">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retour à l'accueil
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Se connecter
          </button>
        </div>
        {redirectCount > 0 && (
          <p className="text-sm text-gray-500">
            Redirection automatique en cours... ({redirectCount}/3)
          </p>
        )}
      </div>
    </div>
  );
};

export default NotFound;
