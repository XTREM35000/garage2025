import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useWorkflow } from '@/contexts/WorkflowProvider';
import { WorkflowStep } from '@/types/workflow.d';

export function useAuthWorkflow() {
  const { user, session, isAuthenticated } = useAuthSession();
  const { state, completeStep, isLoading } = useWorkflow();

  // Vérification automatique du workflow
  const checkWorkflow = useCallback(async () => {
    if (!session?.user || isLoading) return;

    try {
      console.log('🔍 [useAuthWorkflow] Vérification workflow pour:', session.user.email);

      // 1. Vérifier Super Admin
      const { data: isSuperAdmin, error: superAdminError } = await supabase.rpc('is_super_admin');
      
      if (superAdminError) {
        console.error('❌ [useAuthWorkflow] Erreur vérification super admin:', superAdminError);
        return;
      }

      if (isSuperAdmin && state.currentStep === 'super_admin_check') {
        console.log('👑 [useAuthWorkflow] Super admin détecté, passage au pricing');
        await completeStep('super_admin_check');
        return;
      }

      // 2. Vérifier existence admin
      if (state.currentStep === 'admin_creation') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'admin') {
          console.log('👤 [useAuthWorkflow] Admin trouvé, passage à la création org');
          await completeStep('admin_creation');
          return;
        }
      }

      // 3. Vérifier organisation
      if (state.currentStep === 'org_creation') {
        const { data: organizations } = await supabase
          .from('user_organisations')
          .select('organisation_id, role')
          .eq('user_id', session.user.id);

        if (organizations && organizations.length > 0) {
          console.log('🏢 [useAuthWorkflow] Organisation trouvée, passage à SMS');
          await completeStep('org_creation');
          return;
        }
      }

      // 4. Vérifier validation SMS (simulation avec code fixe)
      if (state.currentStep === 'sms_validation') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone_verified')
          .eq('id', session.user.id)
          .single();

        if (profile?.phone_verified) {
          console.log('📱 [useAuthWorkflow] SMS validé, passage au garage');
          await completeStep('sms_validation');
          return;
        }
      }

      // 5. Vérifier garage
      if (state.currentStep === 'garage_setup') {
        const { data: garages } = await supabase
          .from('garages')
          .select('id')
          .limit(1);

        if (garages && garages.length > 0) {
          console.log('🔧 [useAuthWorkflow] Garage configuré, passage au dashboard');
          await completeStep('garage_setup');
          return;
        }
      }

      console.log('📊 [useAuthWorkflow] Étape courante maintenue:', state.currentStep);
    } catch (error) {
      console.error('❌ [useAuthWorkflow] Erreur vérification workflow:', error);
    }
  }, [session, state.currentStep, completeStep, isLoading]);

  // Auto-check à chaque changement de session
  useEffect(() => {
    if (isAuthenticated && session?.user && !isLoading) {
      checkWorkflow();
    }
  }, [isAuthenticated, session?.user, checkWorkflow, isLoading]);

  return {
    user,
    session,
    isAuthenticated,
    workflowState: state,
    checkWorkflow
  };
}