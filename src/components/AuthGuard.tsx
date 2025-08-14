import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, validateSession, clearSession } from '@/integrations/supabase/client';
import OrganizationSelect from './OrganizationSelect';
import { toast } from 'sonner';

type AuthState = 'loading' | 'unauthenticated' | 'selecting-org' | 'authenticated';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 Vérification de l\'authentification...');

      // Valider la session
      await validateSession();

      // Obtenir l'utilisateur
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('❌ Erreur utilisateur:', userError);
        await clearSession();
        setAuthState('unauthenticated');
        return;
      }

      setCurrentUser(user);
      console.log('✅ Utilisateur authentifié:', user.email);

      // Vérifier l'organisation stockée
      const storedOrg = localStorage.getItem('current_org');
      const storedOrgCode = localStorage.getItem('org_code');

      if (storedOrg && storedOrgCode) {
        try {
          // Vérifier si l'organisation existe et si le code correspond
          const { data: org, error: orgError } = await supabase
            .from('organisations')
            .select('id, code')
            .eq('id', storedOrg)
            .eq('code', storedOrgCode)
            .single();

          if (!orgError && org) {
            setSelectedOrg({ id: storedOrg, code: storedOrgCode });
            setAuthState('authenticated');
            return;
          } else {
            console.log('⚠️ Organisation stockée invalide, nettoyage');
            localStorage.removeItem('current_org');
            localStorage.removeItem('org_code');
          }
        } catch (error) {
          console.error('❌ Erreur validation organisation:', error);
          localStorage.removeItem('current_org');
          localStorage.removeItem('org_code');
        }
      }

      // Utilisateur authentifié mais doit sélectionner une organisation
      setAuthState('selecting-org');

    } catch (error) {
      console.error('❌ Erreur vérification auth:', error);
      await clearSession();
      setAuthState('unauthenticated');
    }
  };

  // Redirection si non authentifié
  useEffect(() => {
    if (authState === 'unauthenticated') {
      navigate('/auth');
    }
  }, [authState, navigate]);

  const handleOrgSelect = async (orgId: string, orgCode: string) => {
    try {
      console.log('🔍 Validation organisation:', { orgId, orgCode, userId: currentUser.id });
      
      // Vérifier d'abord si l'organisation existe et si le code correspond
      const { data: org, error: orgError } = await supabase
        .from('organisations')
        .select('id, code')
        .eq('id', orgId)
        .eq('code', orgCode)
        .single();

      if (orgError || !org) {
        toast.error('Code d\'accès invalide ou accès refusé');
        return;
      }

      // Si l'organisation existe et le code correspond, permettre l'accès (mode demo)
      localStorage.setItem('current_org', orgId);
      localStorage.setItem('org_code', orgCode);

      setSelectedOrg({ id: orgId, code: orgCode });
      setAuthState('authenticated');

      toast.success('Organisation sélectionnée avec succès !');

    } catch (error) {
      console.error('❌ Erreur sélection organisation:', error);
      toast.error('Erreur lors de la sélection de l\'organisation');
    }
  };

  const handleLogout = async () => {
    try {
      await clearSession();
      setAuthState('unauthenticated');
      setCurrentUser(null);
      setSelectedOrg(null);
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // États de rendu
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  if (authState === 'selecting-org') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Sélectionnez votre organisation
            </h2>
            <p className="text-gray-600">
              Choisissez l'organisation à laquelle vous souhaitez accéder
            </p>
          </div>

          <OrganizationSelect onSelect={handleOrgSelect} />

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authState === 'authenticated' && selectedOrg) {
    return (
      <div>
        {/* Header avec informations utilisateur */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Connecté en tant que {currentUser?.email}
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            Déconnexion
          </button>
        </div>

        {/* Contenu principal */}
        {children}
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">État d'authentification inconnu</p>
      </div>
    </div>
  );
};

export default AuthGuard;

