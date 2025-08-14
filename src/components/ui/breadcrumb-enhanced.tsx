import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Tableau de bord',
  clients: 'Clients',
  'clients/liste': 'Liste des clients',
  'clients/ajouter': 'Ajouter un client',
  'clients/historique': 'Historique des clients',
  vehicules: 'Véhicules',
  reparations: 'Réparations',
  stock: 'Stock',
  personnel: 'Personnel',
  profil: 'Profil',
  settings: 'Paramètres',
  aide: 'Aide',
  'a-propos': 'À propos'
};

export const BreadcrumbEnhanced: React.FC<BreadcrumbProps> = ({ 
  items, 
  showHome = true 
}) => {
  const location = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;
    
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    if (showHome) {
      breadcrumbs.push({
        label: 'Accueil',
        path: '/dashboard',
        icon: <Home className="h-4 w-4" />
      });
    }
    
    let currentPath = '';
    pathnames.forEach((pathname, index) => {
      currentPath += `/${pathname}`;
      const isLast = index === pathnames.length - 1;
      
      const label = routeLabels[pathnames.slice(0, index + 1).join('/')] || 
                   pathname.charAt(0).toUpperCase() + pathname.slice(1);
      
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          )}
          
          {index === breadcrumbs.length - 1 ? (
            <span className="flex items-center gap-2 text-foreground font-medium">
              {item.icon}
              {item.label}
            </span>
          ) : (
            <Link
              to={item.path}
              className="flex items-center gap-2 hover:text-foreground transition-colors duration-200"
            >
              {item.icon}
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};