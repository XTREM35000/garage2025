import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Shield, Database, RefreshCw, Trash2, Download, Upload, Users, Menu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { DemoService } from '@/integrations/supabase/demoService';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  email?: string;
}

interface UserOrganization {
  user_id: string;
  organisation_id: string;
  role: string;
  organisations?: {
    id: string;
    name: string;
    slug: string;
  };
}

const UserMenu: React.FC = () => {
  const { user: authUser, isAuthenticated, signOut } = useSimpleAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userOrganization, setUserOrganization] = useState<UserOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { isDark } = useTheme();

  // Récupérer les données utilisateur mises à jour
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) return;

      try {
        setLoading(true);
        
        console.log('🔍 Debug UserMenu - AuthUser:', authUser);
        console.log('🔍 Debug UserMenu - AuthUser metadata:', authUser.user_metadata);
        
        // Récupérer le profil utilisateur depuis la table users
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        console.log('🔍 Debug UserMenu - Profile data:', profileData);
        console.log('🔍 Debug UserMenu - Profile error:', profileError);

        if (profileData) {
          setUserProfile(profileData);
        }

        // Récupérer l'organisation de l'utilisateur
        const { data: orgData, error: orgError } = await supabase
          .from('user_organizations')
          .select(`
            *,
            organisations (*)
          `)
          .eq('user_id', authUser.id)
          .single();

        console.log('🔍 Debug UserMenu - Organization data:', orgData);
        console.log('🔍 Debug UserMenu - Organization error:', orgError);

        if (orgData) {
          setUserOrganization(orgData);
        }

      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);

    // Fonction pour obtenir l'avatar utilisateur
  const getUserAvatar = () => {
    console.log('🔍 Debug UserMenu - getUserAvatar called');
    console.log('🔍 Debug UserMenu - userProfile:', userProfile);
    console.log('🔍 Debug UserMenu - authUser metadata:', authUser?.user_metadata);
    
    // Priorité 1: Avatar depuis le profil utilisateur (table users)
    if (userProfile?.avatar_url) {
      console.log('🔍 Debug UserMenu - Avatar from profile:', userProfile.avatar_url);
      return userProfile.avatar_url;
    }

    // Priorité 2: Avatar depuis l'auth metadata
    if (authUser?.user_metadata?.avatar_url) {
      console.log('🔍 Debug UserMenu - Avatar from auth:', authUser.user_metadata.avatar_url);
      return authUser.user_metadata.avatar_url;
    }

    // Priorité 3: Avatar depuis les données locales (fallback)
    const localUser = localStorage.getItem('user');
    if (localUser) {
      const parsedUser = JSON.parse(localUser);
      if (parsedUser.avatar) {
        console.log('🔍 Debug UserMenu - Avatar from localStorage:', parsedUser.avatar);
        return parsedUser.avatar;
      }
    }

    console.log('🔍 Debug UserMenu - No avatar found');
    return null;
  };

  // Fonction pour obtenir le nom d'utilisateur
  const getUserName = () => {
    console.log('🔍 Debug UserMenu - getUserName called');
    
    // Priorité 1: Nom depuis le profil utilisateur (table users)
    if (userProfile?.full_name) {
      console.log('🔍 Debug UserMenu - Name from profile:', userProfile.full_name);
      return userProfile.full_name;
    }

    // Priorité 2: Nom depuis l'auth metadata
    if (authUser?.user_metadata?.full_name) {
      console.log('🔍 Debug UserMenu - Name from auth:', authUser.user_metadata.full_name);
      return authUser.user_metadata.full_name;
    }

    // Priorité 3: Nom depuis les données locales (fallback)
    const localUser = localStorage.getItem('user');
    if (localUser) {
      const parsedUser = JSON.parse(localUser);
      if (parsedUser.nom && parsedUser.prenom) {
        const fullName = `${parsedUser.nom} ${parsedUser.prenom}`;
        console.log('🔍 Debug UserMenu - Name from localStorage:', fullName);
        return fullName;
      }
    }

    console.log('🔍 Debug UserMenu - Using email as name:', authUser?.email);
    return authUser?.email || 'Utilisateur';
  };

  // Fonction pour obtenir le rôle
  const getUserRole = () => {
    // Priorité 1: Rôle depuis le profil utilisateur
    if (userProfile?.role) {
      return userProfile.role;
    }

    // Priorité 2: Rôle depuis l'auth
    if (authUser?.user_metadata?.role) {
      return authUser.user_metadata.role;
    }

    return 'Utilisateur';
  };

  // Fonction pour obtenir l'organisation
  const getUserOrganization = () => {
    if (userOrganization?.organisations?.name) {
      return userOrganization.organisations.name;
    }
    return null;
  };

  // Fonction pour obtenir les initiales
  const getInitials = () => {
    const name = getUserName();
    if (name === 'Utilisateur' || name === authUser?.email) {
      return 'U';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleLogout = async () => {
    try {
      // 1. Déconnexion Supabase
      await signOut();
      
      // 2. Nettoyage localStorage
    localStorage.removeItem('auth');
    localStorage.removeItem('garageData');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('demoUserData');
      localStorage.removeItem('selectedOrganisationSlug');
      
      // 3. Nettoyage sessionStorage
      sessionStorage.clear();
      
      // 4. Nettoyage cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // 5. Redirection vers la page d'auth
      navigate('/auth');
      
      // 6. Rechargement pour s'assurer que tout est nettoyé
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, forcer la redirection
      navigate('/auth');
    }
  };

  const handleResetDemo = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données de démonstration ?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleClearData = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

    const handleInjectDemoData = async () => {
    if (confirm('Voulez-vous injecter des données de démonstration dans la base de données ?')) {
      try {
        const result = await DemoService.injectDemoData();

        if (result.success) {
          alert('Données de démonstration injectées avec succès !');
          window.location.reload();
        } else {
          alert('Erreur lors de l\'injection des données : ' + result.error);
        }
      } catch (error) {
        alert('Erreur de connexion : ' + (error as Error).message);
      }
    }
  };

  const handleClearDemoData = async () => {
    if (confirm('Voulez-vous supprimer toutes les données de démonstration ? Cette action est irréversible.')) {
      try {
        const result = await DemoService.clearDemoData();

        if (result.success) {
          alert('Données de démonstration supprimées avec succès !');
          window.location.reload();
        } else {
          alert('Erreur lors de la suppression : ' + result.error);
        }
      } catch (error) {
        alert('Erreur de connexion : ' + (error as Error).message);
      }
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Menu mobile hamburger */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getUserName()}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {authUser?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {getUserRole()}
                  {getUserOrganization() && ` • ${getUserOrganization()}`}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Menu principal mobile */}
            <DropdownMenuItem asChild>
              <Link to="/profil" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Mon Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Sous-menu Admin mobile */}
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              ADMIN
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/dashboard" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>Tableau de bord</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/clients" className="flex items-center">
                <Database className="mr-2 h-4 w-4" />
                <span>Gestion clients</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/personnel" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>Gestion du personnel</span>
              </Link>
            </DropdownMenuItem>
            {(getUserRole() === 'admin' || getUserRole() === 'super_admin' || getUserRole() === 'Admin') && (
              <DropdownMenuItem asChild>
                <Link to="/personnel" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Personnel</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleInjectDemoData}>
              <Download className="mr-2 h-4 w-4" />
              <span>Injecter données démo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleClearDemoData}>
              <Upload className="mr-2 h-4 w-4" />
              <span>Supprimer données démo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleResetDemo}>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Réinitialiser localStorage</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleClearData} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Supprimer toutes les données</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Avatar et menu utilisateur desktop */}
      <div className="hidden md:block">
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden">
            {getUserAvatar() ? (
              <img
                src={getUserAvatar()}
                alt={getUserName()}
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  // Fallback en cas d'erreur de chargement de l'image
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`h-full w-full rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center ${getUserAvatar() ? 'hidden' : ''}`}>
              <span className="text-white text-sm font-medium">{getInitials()}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{getUserName()}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {authUser?.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {getUserRole()}
                {getUserOrganization() && ` • ${getUserOrganization()}`}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Menu principal */}
          <DropdownMenuItem asChild>
            <Link to="/profil" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Mon Profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Sous-menu Admin (pour démo) */}
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            ADMIN
          </DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Tableau de bord</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/clients" className="flex items-center">
              <Database className="mr-2 h-4 w-4" />
              <span>Gestion clients</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/personnel" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>Gestion du personnel</span>
            </Link>
          </DropdownMenuItem>
          {(getUserRole() === 'admin' || getUserRole() === 'super_admin' || getUserRole() === 'Admin') && (
            <DropdownMenuItem asChild>
              <Link to="/personnel" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>Personnel</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleInjectDemoData}>
            <Download className="mr-2 h-4 w-4" />
            <span>Injecter données démo</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleClearDemoData}>
            <Upload className="mr-2 h-4 w-4" />
            <span>Supprimer données démo</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleResetDemo}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Réinitialiser localStorage</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleClearData} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Supprimer toutes les données</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
        </div>
      </div>
    );
  };

  export default UserMenu;
