import React from 'react';
import { Car, Wrench, Zap, User, LogOut, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Header: React.FC = () => {
  const { user, signOut } = useSimpleAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/auth');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      superadmin: 'Super Admin',
      admin: 'Administrateur',
      manager: 'Manager',
      technicien: 'Technicien',
      employe: 'Employé'
    };
    return roleLabels[role as keyof typeof roleLabels] || 'Employé';
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      superadmin: 'bg-purple-500',
      admin: 'bg-red-500',
      manager: 'bg-blue-500',
      technicien: 'bg-green-500',
      employe: 'bg-gray-500'
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-500';
  };

  return (
    <header className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 shadow-lg py-4 px-8 flex items-center justify-between animate-fade-in sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        {/* Logo animé */}
        <div className="relative">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
            <div className="relative">
              <Car className="w-7 h-7 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1">
                <Wrench className="w-4 h-4 text-yellow-300 animate-bounce" />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1">
            <Zap className="w-3 h-3 text-yellow-400 animate-ping" />
          </div>
        </div>

        {/* Titre et sous-titre */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
            Garage Multi 2025
          </h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-sm text-white/90 font-medium">
              Système de gestion
            </p>
          </div>
        </div>
      </div>

      {/* Informations utilisateur et actions */}
      <div className="flex items-center space-x-4">
        {/* Indicateurs de statut */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-white font-medium">Système Opérationnel</span>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/20">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            <span className="text-xs text-white font-medium">3 Interventions en cours</span>
          </div>
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 transition-colors"
        >
          <Bell className="w-5 h-5" />
        </Button>

        {/* Menu utilisateur */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div className="flex flex-col">
              <span className="text-xs text-white/70">
                {user?.email}
              </span>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="text-white hover:bg-white/10 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
