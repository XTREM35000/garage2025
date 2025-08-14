import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationHistory {
  path: string;
  title: string;
  timestamp: number;
}

export const useNavigationHistory = () => {
  const [history, setHistory] = useState<NavigationHistory[]>([]);
  const location = useLocation();

  // Mapping des titres de pages
  const pageTitles: { [key: string]: string } = {
    '/dashboard': 'Tableau de bord',
    '/clients/liste': 'Liste des clients',
    '/clients/ajouter': 'Ajouter un client',
    '/clients/historique': 'Historique des clients',
    '/vehicules': 'Gestion des véhicules',
    '/reparations': 'Réparations',
    '/stock': 'Gestion du stock',
    '/profil': 'Mon profil',
    '/settings': 'Paramètres',
    '/a-propos': 'À propos',
    '/aide': 'Aide'
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const currentTitle = pageTitles[currentPath] || 'Page';

    // Ajouter la page actuelle à l'historique si elle n'y est pas déjà
    setHistory(prev => {
      const exists = prev.some(item => item.path === currentPath);
      if (!exists) {
        return [
          ...prev,
          {
            path: currentPath,
            title: currentTitle,
            timestamp: Date.now()
          }
        ].slice(-10); // Garder seulement les 10 dernières pages
      }
      return prev;
    });
  }, [location.pathname]);

  const getPreviousPage = (): NavigationHistory | null => {
    if (history.length < 2) return null;
    return history[history.length - 2];
  };

  const getPageTitle = (path: string): string => {
    return pageTitles[path] || 'Page';
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    getPreviousPage,
    getPageTitle,
    clearHistory,
    currentPage: history[history.length - 1] || null
  };
};
