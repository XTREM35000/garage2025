import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  AlertCircle,
  User,
  Shield,
  Building,
  RefreshCw
} from 'lucide-react';
import '../styles/whatsapp-theme.css';

const WorkflowTest: React.FC = () => {
  const [workflowState, setWorkflowState] = useState<string>('loading');
  const [superAdminCount, setSuperAdminCount] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userOrganization, setUserOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkWorkflowStatus = async () => {
    try {
      setLoading(true);
      console.log('🔍 Vérification du statut du workflow...');

      // 1. Vérifier le nombre de super admins
      const { count: superAdminCount, error: superAdminError } = await supabase
        .from('super_admins')
        .select('*', { count: 'exact' });

      if (superAdminError) {
        console.error('❌ Erreur vérification super admin:', superAdminError);
      } else {
        setSuperAdminCount(superAdminCount || 0);
        console.log('👑 Nombre de super admins:', superAdminCount);
      }

      // 2. Vérifier l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        console.log('✅ Utilisateur connecté:', user.email);

        // 3. Récupérer le profil utilisateur
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('❌ Erreur récupération profil:', profileError);
        } else {
          setUserProfile(profile);
          console.log('👤 Profil utilisateur:', profile);
        }

        // 4. Récupérer l'organisation de l'utilisateur
        const { data: orgData, error: orgError } = await supabase
          .from('user_organizations')
          .select(`
            *,
            organisations (*)
          `)
          .eq('user_id', user.id)
          .single();

        if (orgError && orgError.code !== 'PGRST116') {
          console.error('❌ Erreur récupération organisation:', orgError);
        } else if (orgData) {
          setUserOrganization(orgData);
          console.log('🏢 Organisation utilisateur:', orgData);
        }

        // 5. Déterminer l'état du workflow
        if (superAdminCount === 0) {
          setWorkflowState('needs-super-admin');
        } else if (profile?.role === 'admin' && orgData?.status === 'tenant') {
          setWorkflowState('ready-for-dashboard');
        } else {
          setWorkflowState('needs-onboarding');
        }
      } else {
        console.log('⚠️ Aucun utilisateur connecté');
        if (superAdminCount === 0) {
          setWorkflowState('needs-super-admin');
        } else {
          setWorkflowState('needs-auth');
        }
      }

    } catch (error) {
      console.error('❌ Erreur vérification workflow:', error);
      setWorkflowState('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkWorkflowStatus();
  }, []);

  const getWorkflowStatusInfo = () => {
    switch (workflowState) {
      case 'needs-super-admin':
        return {
          title: 'Création Super Admin Requise',
          description: 'Aucun super admin n\'existe. Création du premier super admin nécessaire.',
          icon: Shield,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };

      case 'needs-auth':
        return {
          title: 'Authentification Requise',
          description: 'Super admin existe. Connexion utilisateur nécessaire pour continuer.',
          icon: User,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };

      case 'needs-onboarding':
        return {
          title: 'Onboarding Requis',
          description: 'Utilisateur connecté mais onboarding non terminé.',
          icon: Building,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };

      case 'ready-for-dashboard':
        return {
          title: 'Prêt pour le Dashboard',
          description: 'Utilisateur Admin/Tenant détecté. Accès au dashboard autorisé.',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };

      case 'error':
        return {
          title: 'Erreur de Vérification',
          description: 'Erreur lors de la vérification du workflow.',
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };

      default:
        return {
          title: 'Vérification en cours...',
          description: 'Analyse du statut du workflow...',
          icon: RefreshCw,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusInfo = getWorkflowStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-whatsapp">
          <div className="loading-whatsapp-spinner"></div>
          <span>Vérification du workflow...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test du Workflow - Garage 2025
          </h1>
          <p className="text-gray-600">
            Vérification du statut du workflow et des permissions
          </p>
        </div>

        {/* Statut du Workflow */}
        <Card className={`card-whatsapp border-2 ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
          <CardHeader className="card-whatsapp-header">
            <div className="flex items-center space-x-3">
              <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
              <CardTitle className={statusInfo.color}>
                {statusInfo.title}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="card-whatsapp-body">
            <p className="text-gray-700 mb-4">{statusInfo.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-2">Super Admins</h4>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <span className="text-lg font-bold">{superAdminCount}</span>
                  <Badge variant={superAdminCount > 0 ? "default" : "destructive"}>
                    {superAdminCount > 0 ? 'Existe' : 'Manquant'}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-2">Utilisateur</h4>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">
                    {userProfile ? userProfile.email : 'Non connecté'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Détails du Profil */}
        {userProfile && (
          <Card className="card-whatsapp">
            <CardHeader className="card-whatsapp-header">
              <CardTitle>Profil Utilisateur</CardTitle>
            </CardHeader>
            <CardContent className="card-whatsapp-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Rôle</label>
                  <p className="text-lg font-semibold text-gray-900">{userProfile.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg font-semibold text-gray-900">{userProfile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nom</label>
                  <p className="text-lg font-semibold text-gray-900">{userProfile.nom}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Détails de l'Organisation */}
        {userOrganization && (
          <Card className="card-whatsapp">
            <CardHeader className="card-whatsapp-header">
              <CardTitle>Organisation Utilisateur</CardTitle>
            </CardHeader>
            <CardContent className="card-whatsapp-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Rôle</label>
                  <p className="text-lg font-semibold text-gray-900">{userOrganization.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <p className="text-lg font-semibold text-gray-900">{userOrganization.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Organisation ID</label>
                  <p className="text-sm font-mono text-gray-600">{userOrganization.organisation_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={checkWorkflowStatus}
            className="btn-whatsapp-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>

          {workflowState === 'needs-super-admin' && (
            <Button
              onClick={() => window.location.reload()}
              className="btn-whatsapp-success"
            >
              Démarrer l'Initialisation
            </Button>
          )}
        </div>

        {/* Instructions */}
        <Card className="card-whatsapp">
          <CardHeader className="card-whatsapp-header">
            <CardTitle>Instructions de Test</CardTitle>
          </CardHeader>
          <CardContent className="card-whatsapp-body">
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>1. Super Admin manquant :</strong> L'application doit afficher le formulaire de création</p>
              <p><strong>2. Super Admin existe :</strong> L'application doit rediriger vers le login ou l'onboarding</p>
              <p><strong>3. Utilisateur Admin/Tenant :</strong> L'application doit afficher le dashboard</p>
              <p><strong>4. Erreurs :</strong> Vérifier la console pour les détails techniques</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowTest;
