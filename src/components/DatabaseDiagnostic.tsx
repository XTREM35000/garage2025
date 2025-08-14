import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface DatabaseState {
  superAdmins: {
    count: number;
    error?: string;
  };
  organisations: {
    count: number;
    error?: string;
  };
  users: {
    count: number;
    adminCount: number;
    error?: string;
  };
  session: {
    exists: boolean;
    error?: string;
  };
}

const DatabaseDiagnostic: React.FC = () => {
  const [dbState, setDbState] = useState<DatabaseState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const checkDatabaseState = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Diagnostic de la base de données...');

      // Vérifier les super admins
      const { count: superAdminCount, error: superAdminError } = await supabase
        .from('super_admins')
        .select('*', { count: 'exact', head: true });

      // Vérifier les organisations
      const { count: orgCount, error: orgError } = await supabase
        .from('organisations')
        .select('*', { count: 'exact', head: true });

      // Vérifier les utilisateurs
      const { count: userCount, error: userError } = await supabase
.from('profiles')
        .select('*', { count: 'exact', head: true });

      // Vérifier les admins
      const { count: adminCount, error: adminError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      // Vérifier la session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      setDbState({
        superAdmins: {
          count: superAdminCount || 0,
          error: superAdminError?.message
        },
        organisations: {
          count: orgCount || 0,
          error: orgError?.message
        },
        users: {
          count: userCount || 0,
          adminCount: adminCount || 0,
          error: userError?.message || adminError?.message
        },
        session: {
          exists: !!session,
          error: sessionError?.message
        }
      });

      console.log('✅ Diagnostic terminé');
    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
      setDbState({
        superAdmins: { count: 0, error: 'Erreur de connexion' },
        organisations: { count: 0, error: 'Erreur de connexion' },
        users: { count: 0, adminCount: 0, error: 'Erreur de connexion' },
        session: { exists: false, error: 'Erreur de connexion' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDatabaseState();
  }, []);

  const getWorkflowRecommendation = () => {
    if (!dbState) return 'Diagnostic en cours...';

    if (dbState.superAdmins.count === 0) {
      return 'PREMIER LANCEMENT - Créer un Super Admin';
    }

    if (dbState.organisations.count === 0) {
      return 'AFFICHER PRICING - Choisir un plan';
    }

    if (dbState.users.adminCount === 0) {
      return 'CRÉER ADMIN - Créer un compte administrateur';
    }

    if (!dbState.session.exists) {
      return 'AUTHENTIFICATION - Se connecter';
    }

    return 'PRÊT - Accès au dashboard';
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-white/80 backdrop-blur-sm"
        >
          <Database className="w-4 h-4 mr-2" />
          Diagnostic BD
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Diagnostic Base de Données
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              Fermer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recommandation */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Recommandation :</strong> {getWorkflowRecommendation()}
            </AlertDescription>
          </Alert>

          {/* État de chargement */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Diagnostic en cours...</span>
            </div>
          )}

          {/* Résultats du diagnostic */}
          {dbState && (
            <div className="space-y-4">
              {/* Super Admins */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  {getStatusIcon(dbState.superAdmins.count > 0)}
                  Super Admins
                </h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <div><strong>Nombre :</strong> {dbState.superAdmins.count}</div>
                  {dbState.superAdmins.error && (
                    <div className="text-red-600"><strong>Erreur :</strong> {dbState.superAdmins.error}</div>
                  )}
                </div>
              </div>

              {/* Organisations */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  {getStatusIcon(dbState.organisations.count > 0)}
                  Organisations
                </h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <div><strong>Nombre :</strong> {dbState.organisations.count}</div>
                  {dbState.organisations.error && (
                    <div className="text-red-600"><strong>Erreur :</strong> {dbState.organisations.error}</div>
                  )}
                </div>
              </div>

              {/* Utilisateurs */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  {getStatusIcon(dbState.users.count > 0)}
                  Utilisateurs
                </h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <div><strong>Total :</strong> {dbState.users.count}</div>
                  <div><strong>Admins :</strong> {dbState.users.adminCount}</div>
                  {dbState.users.error && (
                    <div className="text-red-600"><strong>Erreur :</strong> {dbState.users.error}</div>
                  )}
                </div>
              </div>

              {/* Session */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  {getStatusIcon(dbState.session.exists)}
                  Session Utilisateur
                </h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <div><strong>État :</strong> {dbState.session.exists ? 'Connecté' : 'Non connecté'}</div>
                  {dbState.session.error && (
                    <div className="text-red-600"><strong>Erreur :</strong> {dbState.session.error}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={checkDatabaseState} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseDiagnostic;
