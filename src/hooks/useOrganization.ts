import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useOrganization() {
  const [currentOrg, setCurrentOrg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrganization = async () => {
      const storedOrgId = localStorage.getItem('current_org');

      if (storedOrgId) {
        const { data: org } = await supabase
          .from('organisations')
          .select('*')
          .eq('id', storedOrgId)
          .single();

        setCurrentOrg(org);
      }

      setIsLoading(false);
    };

    loadOrganization();
  }, []);

  return { currentOrg, isLoading };
}