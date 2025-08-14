import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, ChevronLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface PageNavigationProps {
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
  customBackAction?: () => void;
}

const PageNavigation: React.FC<PageNavigationProps> = ({
  title,
  showBackButton = true,
  backTo,
  customBackAction
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  // Déterminer le titre de la page basé sur le chemin
  const getPageTitle = () => {
    if (title) return title;

    // Debug: afficher le chemin actuel
    console.log('PageNavigation - Current path:', location.pathname);

    const pathMap: { [key: string]: string } = {
      '/dashboard': 'Tableau de bord',
      '/clients': 'Gestion des clients',
      '/clients/liste': 'Liste des clients',
      '/clients/ajouter': 'Ajouter un client',
      '/clients/historique': 'Historique des clients',
      '/vehicules': 'Gestion des véhicules',
      '/reparations': 'Réparations',
      '/stock': 'Gestion du stock',
      '/personnel': 'Gestion du personnel',
      '/profil': 'Mon profil',
      '/settings': 'Paramètres',
      '/a-propos': 'À propos',
      '/aide': 'Aide',
      '/debug': 'Debug',
      '/auth': 'Authentification',
      '/setup': 'Configuration'
    };

    // Essayer de trouver une correspondance exacte d'abord
    if (pathMap[location.pathname]) {
      return pathMap[location.pathname];
    }

    // Si pas de correspondance exacte, essayer de faire correspondre par segment
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const firstSegment = segments[0];
      const segmentMap: { [key: string]: string } = {
        'clients': 'Gestion des clients',
        'vehicules': 'Gestion des véhicules',
        'reparations': 'Réparations',
        'stock': 'Gestion du stock',
        'personnel': 'Gestion du personnel',
        'profil': 'Mon profil',
        'settings': 'Paramètres',
        'aide': 'Aide',
        'debug': 'Debug'
      };
      
      if (segmentMap[firstSegment]) {
        return segmentMap[firstSegment];
      }
    }

    // Fallback : capitaliser le premier segment du chemin
    const fallbackSegments = location.pathname.split('/').filter(Boolean);
    if (fallbackSegments.length > 0) {
      const firstSegment = fallbackSegments[0];
      // Améliorer l'affichage pour certains segments
      const improvedTitles: { [key: string]: string } = {
        'clients': 'Gestion des clients',
        'vehicules': 'Gestion des véhicules',
        'reparations': 'Réparations',
        'stock': 'Gestion du stock',
        'personnel': 'Gestion du personnel',
        'profil': 'Mon profil',
        'settings': 'Paramètres',
        'aide': 'Aide',
        'debug': 'Debug'
      };
      
      return improvedTitles[firstSegment] || firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
    }

    return 'Page';
  };

  const handleBack = () => {
    if (customBackAction) {
      customBackAction();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  // Ne pas afficher sur la page d'accueil
  if (location.pathname === '/') {
    return null;
  }

  return (
    <div className={`w-full backdrop-blur-sm border-b shadow-sm transition-all duration-300 ${
      isDark
        ? 'bg-gray-900/50 border-gray-700/50'
        : 'bg-white/60 border-gray-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Section gauche : Navigation et titre */}
          <div className="flex items-center space-x-4">
            {/* Bouton retour */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className={`group flex items-center space-x-2 transition-all duration-200 rounded-xl px-4 py-2 hover:scale-105 ${
                  isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800/80'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-sm font-medium">Retour</span>
              </Button>
            )}

            {/* Séparateur vertical */}
            <div className={`w-px h-8 ${isDark ? 'bg-gray-600/50' : 'bg-gray-300/50'}`} />

            {/* Titre de la page avec icône */}
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-gray-800/50' : 'bg-green-50'
              }`}>
                <MapPin className={`w-5 h-5 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
              <div className="flex flex-col">
                <h2 className={`text-xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {getPageTitle()}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                  <span className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Page active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section droite : Actions rapides */}
          <div className="flex items-center space-x-3">
            {/* Indicateur de navigation */}
            <div className={`hidden sm:flex items-center space-x-2 px-3 py-1 rounded-lg ${
              isDark ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                isDark ? 'bg-green-400' : 'bg-green-500'
              }`} />
              <span className={`text-xs font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Navigation
              </span>
            </div>

            {/* Bouton accueil */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className={`transition-all duration-200 rounded-xl px-4 py-2 hover:scale-105 ${
                isDark
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800/80'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/80'
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Accueil</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNavigation;
