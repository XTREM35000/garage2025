import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import OrganizationSelect from './OrganizationSelect';
import { toast } from 'sonner';

interface PostAuthHandlerProps {
  children: React.ReactNode;
}

const PostAuthHandler: React.FC<PostAuthHandlerProps> = ({ children }) => {
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  useEffect(() => {
    checkOrganizationStatus();
  }, []);

  const checkOrganizationStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setHasOrganization(false);
        return;
      }

      const storedOrg = localStorage.getItem('current_org');
      const storedOrgCode = localStorage.getItem('org_code');

      if (storedOrg && storedOrgCode) {
        // Vérifier si l'organisation existe et si le code correspond
        try {
          const { data: org, error: orgError } = await supabase
            .from('organisations')
            .select('id, code')
            .eq('id', storedOrg)
            .eq('code', storedOrgCode)
            .single();

          if (!orgError && org) {
            setSelectedOrg({ id: storedOrg, code: storedOrgCode });
            setHasOrganization(true);
            return;
          }
        } catch (error) {
          console.error('Erreur validation organisation:', error);
        }
        
        // Si la validation échoue, nettoyer le localStorage
        localStorage.removeItem('current_org');
        localStorage.removeItem('org_code');
      }

      setHasOrganization(false);
    } catch (error) {
      console.error('Erreur vérification organisation:', error);
      setHasOrganization(false);
    }
  };

  const handleOrgSelect = async (orgId: string, orgCode: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Vérifier si l'organisation existe et si le code correspond
      const { data: org, error: orgError } = await supabase
        .from('organisations')
        .select('id, code')
        .eq('id', orgId)
        .eq('code', orgCode)
        .single();

      if (!orgError && org) {
        localStorage.setItem('current_org', orgId);
        localStorage.setItem('org_code', orgCode);
        setSelectedOrg({ id: orgId, code: orgCode });
        setHasOrganization(true);
        toast.success('Organisation sélectionnée avec succès');
      } else {
        toast.error('Accès non autorisé à cette organisation');
      }
    } catch (error) {
      console.error('Erreur sélection organisation:', error);
      toast.error('Erreur lors de la sélection de l\'organisation');
    }
  };

  if (hasOrganization === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'organisation...</p>
        </div>
      </div>
    );
  }

  if (!hasOrganization) {
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
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PostAuthHandler;