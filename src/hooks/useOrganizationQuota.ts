import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';

type BusinessType = 'garage' | 'boutique';

interface QuotaLimits {
  [key: string]: {
    garage: number;
    boutique: number;
  };
}

const QUOTA_LIMITS: QuotaLimits = {
  free: { garage: 1, boutique: 2 },
  monthly: { garage: 3, boutique: 3 },
  annual: { garage: 10, boutique: 10 }
};

export function useOrganizationQuota() {
  const { currentOrg } = useOrganization();

  const checkQuota = useCallback(async (type: BusinessType): Promise<boolean> => {
    if (!currentOrg) {
      throw new Error('Aucune organisation sélectionnée');
    }

    try {
      // Compte le nombre d'instances existantes
      const { count, error } = await supabase
        .from('organisations')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', currentOrg.id)
        .eq('type', type);

      if (error) {
        console.error('Erreur lors de la vérification du quota:', error);
        return false;
      }

      // Récupère la limite max selon le plan
      const maxAllowed = QUOTA_LIMITS[currentOrg.plan_tier]?.[type] ?? 0;

      // Vérifie si on peut créer une nouvelle instance
      return (count ?? 0) < maxAllowed;

    } catch (error) {
      console.error('Erreur inattendue lors de la vérification du quota:', error);
      return false;
    }
  }, [currentOrg]);

  const getRemainingQuota = useCallback(async (type: BusinessType): Promise<number> => {
    if (!currentOrg) return 0;

    try {
      const { count, error } = await supabase
        .from('organisations')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', currentOrg.id)
        .eq('type', type);

      if (error) throw error;

      const maxAllowed = QUOTA_LIMITS[currentOrg.plan_tier]?.[type] ?? 0;
      return Math.max(0, maxAllowed - (count ?? 0));

    } catch (error) {
      console.error('Erreur lors du calcul du quota restant:', error);
      return 0;
    }
  }, [currentOrg]);

  return {
    checkQuota,
    getRemainingQuota,
    quotaLimits: QUOTA_LIMITS
  };
}