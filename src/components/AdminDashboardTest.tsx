import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Building,
  Shield,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle,
  Users,
  Car,
  Wrench,
  DollarSign
} from 'lucide-react';
import '../styles/whatsapp-theme.css';

interface AdminDashboardTestProps {
  onLogout?: () => void;
}

const AdminDashboardTest: React.FC<AdminDashboardTestProps> = ({ onLogout }) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userOrganization, setUserOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Récupérer le profil utilisateur
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            setUserProfile(profile);
          }

          // Récupérer l'organisation de l'utilisateur
          const { data: orgData } = await supabase
            .from('user_organizations')
            .select(`
              *,
              organisations (*)
            `)
            .eq('user_id', user.id)
            .single();

          if (orgData) {
            setUserOrganization(orgData);
          }
        }
      } catch (error) {
        console.error('Erreur récupération données utilisateur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-whatsapp">
          <div className="loading-whatsapp-spinner"></div>
          <span>Chargement du dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#128C7E]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#128C7E] to-[#25D366] rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-sm text-gray-600">Garage 2025</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.nom || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500">
                  {userProfile?.role || 'Rôle inconnu'}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-[#128C7E] text-[#128C7E] hover:bg-[#128C7E] hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informations de statut */}
        <div className="mb-8">
          <Card className="card-whatsapp">
            <CardHeader className="card-whatsapp-header">
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Statut de l'utilisateur</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="card-whatsapp-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-800">Profil</p>
                  <Badge className="bg-green-100 text-green-800 mt-1">
                    {userProfile?.role || 'Non défini'}
                  </Badge>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium text-blue-800">Organisation</p>
                  <Badge className="bg-blue-100 text-blue-800 mt-1">
                    {userOrganization?.status || 'Non défini'}
                  </Badge>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium text-purple-800">Accès</p>
                  <Badge className="bg-purple-100 text-purple-800 mt-1">
                    {userProfile?.role === 'admin' && userOrganization?.status === 'tenant'
                      ? 'Dashboard'
                      : 'Restreint'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-whatsapp hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-whatsapp hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Véhicules</p>
                  <p className="text-2xl font-bold text-gray-900">45</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-whatsapp hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Réparations</p>
                  <p className="text-2xl font-bold text-gray-900">28</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-whatsapp hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-gray-900">2.4M</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-whatsapp">
            <CardHeader className="card-whatsapp-header">
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="card-whatsapp-body">
              <div className="space-y-3">
                <Button className="w-full btn-whatsapp-primary">
                  <User className="w-4 h-4 mr-2" />
                  Ajouter un utilisateur
                </Button>
                <Button className="w-full btn-whatsapp-secondary">
                  <Car className="w-4 h-4 mr-2" />
                  Nouveau véhicule
                </Button>
                <Button className="w-full btn-whatsapp-success">
                  <Wrench className="w-4 h-4 mr-2" />
                  Nouvelle réparation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-whatsapp">
            <CardHeader className="card-whatsapp-header">
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="card-whatsapp-body">
              <div className="space-y-3">
                <Button className="w-full btn-whatsapp-secondary">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
                <Button className="w-full btn-whatsapp-secondary">
                  <Building className="w-4 h-4 mr-2" />
                  Organisation
                </Button>
                <Button className="w-full btn-whatsapp-secondary">
                  <Shield className="w-4 h-4 mr-2" />
                  Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message de succès */}
        {userProfile?.role === 'admin' && userOrganization?.status === 'tenant' && (
          <div className="mt-8">
            <Card className="card-whatsapp border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-medium text-green-800">
                      Dashboard Admin activé avec succès !
                    </h3>
                    <p className="text-green-700">
                      Vous avez maintenant accès à toutes les fonctionnalités d'administration.
                      Votre rôle: <strong>{userProfile.role}</strong>,
                      Statut: <strong>{userOrganization.status}</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardTest;
