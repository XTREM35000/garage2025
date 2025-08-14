import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

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

const UserMenuDebug: React.FC = () => {
  const { user: authUser, isAuthenticated } = useSimpleAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userOrganization, setUserOrganization] = useState<UserOrganization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) return;

      try {
        setLoading(true);
        
        console.log('🔍 Debug - AuthUser:', authUser);
        console.log('🔍 Debug - AuthUser metadata:', authUser.user_metadata);
        
        // Récupérer le profil utilisateur depuis la table users
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        console.log('🔍 Debug - Profile data:', profileData);
        console.log('🔍 Debug - Profile error:', profileError);

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

        console.log('🔍 Debug - Organization data:', orgData);
        console.log('🔍 Debug - Organization error:', orgError);

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

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Debug UserMenu - Non authentifié</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Utilisateur non connecté</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Debug UserMenu - Informations Utilisateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <>
              {/* Informations Auth */}
              <div className="space-y-2">
                <h3 className="font-semibold">Informations Auth (Supabase)</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {authUser?.id}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {authUser?.email}
                  </div>
                  <div>
                    <span className="font-medium">Email vérifié:</span> {authUser?.email_confirmed_at ? 'Oui' : 'Non'}
                  </div>
                  <div>
                    <span className="font-medium">Créé le:</span> {authUser?.created_at}
                  </div>
                </div>
              </div>

              {/* Metadata Auth */}
              <div className="space-y-2">
                <h3 className="font-semibold">Metadata Auth</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(authUser?.user_metadata, null, 2)}
                </pre>
              </div>

              {/* Profil Utilisateur */}
              <div className="space-y-2">
                <h3 className="font-semibold">Profil Utilisateur (Table users)</h3>
                {userProfile ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">ID:</span> {userProfile.id}
                    </div>
                    <div>
                      <span className="font-medium">Nom complet:</span> {userProfile.full_name || 'Non défini'}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {userProfile.email || 'Non défini'}
                    </div>
                    <div>
                      <span className="font-medium">Rôle:</span> {userProfile.role || 'Non défini'}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Avatar URL:</span> {userProfile.avatar_url || 'Non défini'}
                    </div>
                  </div>
                ) : (
                  <p className="text-red-500">Aucun profil trouvé dans la table users</p>
                )}
              </div>

              {/* Organisation */}
              <div className="space-y-2">
                <h3 className="font-semibold">Organisation</h3>
                {userOrganization ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">User ID:</span> {userOrganization.user_id}
                    </div>
                    <div>
                      <span className="font-medium">Organisation ID:</span> {userOrganization.organisation_id}
                    </div>
                    <div>
                      <span className="font-medium">Rôle org:</span> {userOrganization.role}
                    </div>
                    {userOrganization.organisations && (
                      <>
                        <div>
                          <span className="font-medium">Nom org:</span> {userOrganization.organisations.name}
                        </div>
                        <div>
                          <span className="font-medium">Slug org:</span> {userOrganization.organisations.slug}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-red-500">Aucune organisation trouvée</p>
                )}
              </div>

              {/* Résumé pour UserMenu */}
              <div className="space-y-2">
                <h3 className="font-semibold">Résumé pour UserMenu</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Avatar:</span> {userProfile?.avatar_url || authUser?.user_metadata?.avatar_url || 'Aucun'}
                  </div>
                  <div>
                    <span className="font-medium">Nom:</span> {userProfile?.full_name || authUser?.user_metadata?.full_name || authUser?.email || 'Utilisateur'}
                  </div>
                  <div>
                    <span className="font-medium">Rôle:</span> {userProfile?.role || authUser?.user_metadata?.role || 'Utilisateur'}
                  </div>
                  <div>
                    <span className="font-medium">Organisation:</span> {userOrganization?.organisations?.name || 'Aucune'}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserMenuDebug;
