import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { supabase } from '@/integrations/supabase/client';
import { Shield, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DebugInfo {
  session: any;
  user: any;
  isConnected: boolean;
  timestamp: string;
  error?: any;
}

const AuthStatusDebugComponent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useSimpleAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    );
  };

  const handleRefreshDebugInfo = async () => {
    setRefreshing(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();

      setDebugInfo({
        session: session.session,
        user: userData.user,
        isConnected: !!session.session,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors du débogage:', error);
      setDebugInfo({
        session: null,
        user: null,
        isConnected: false,
        timestamp: new Date().toISOString(),
        error: error
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    handleRefreshDebugInfo();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            État de l'authentification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Utilisateur</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Connecté:</span>
                  {getStatusBadge(isAuthenticated, isAuthenticated ? 'Oui' : 'Non')}
                </div>
                <div className="flex justify-between">
                  <span>Chargement:</span>
                  {getStatusBadge(!isLoading, isLoading ? 'En cours' : 'Terminé')}
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-mono text-xs">{user?.email || 'Non défini'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Créé le:</span>
                  <span className="text-xs">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Non défini'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Profil</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>ID:</span>
                  <span className="font-mono text-xs">{user?.id || 'Non défini'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  {getStatusBadge(isAuthenticated, 'Connecté')}
                </div>
              </div>
            </div>
          </div>

          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h5 className="font-medium mb-2">Informations de débogage</h5>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Actions de debug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Auth State:', { user, isAuthenticated, isLoading });
              }}
            >
              Log State
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshDebugInfo}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Actualiser Debug
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Clear LocalStorage
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = '/auth-gate';
              }}
            >
              Go to AuthGate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = '/create-organisation';
              }}
            >
              Go to Create Org
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthStatusDebugComponent;
