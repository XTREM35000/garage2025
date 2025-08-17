import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CompletionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CompletionSummaryModal: React.FC<CompletionSummaryModalProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    adminName: '',
    organisationName: '',
    garageName: '',
    plan: '',
  });

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Charger les données du résumé
        const { data } = await supabase
          .from('onboarding_workflow_states')
          .select(`
            organisation:organisations(name, subscription_plan),
            admin:profiles(name),
            garage:garages(name)
          `)
          .eq('user_id', user.id)
          .single();

        if (data) {
          setSummary({
            adminName: data.admin?.[0]?.name || '',
            organisationName: data.organisation?.[0]?.name || '',
            garageName: data.garage?.[0]?.name || '',
            plan: data.organisation?.[0]?.subscription_plan || '',
          });
        }
      } catch (error) {
        console.error('Erreur chargement résumé:', error);
      }
    };

    if (isOpen) {
      loadSummary();
      // Timer pour la redirection vers le dashboard
      const timer = setTimeout(async () => {
        // Vérifier si l'utilisateur est connecté
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('✅ Redirection vers dashboard avec utilisateur:', session.user.email);
          navigate('/dashboard');
        } else {
          console.log('❌ Pas de session - redirection vers auth');
          navigate('/auth');
        }
        onClose();
      }, 3000); // Réduire le délai pour un test plus rapide

      return () => clearTimeout(timer);
    }
  }, [isOpen, navigate]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-950">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold">Configuration terminée !</h2>

          <div className="space-y-4 text-left">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="font-medium">Administrateur :</p>
              <p className="text-muted-foreground">{summary.adminName}</p>

              <p className="font-medium">Organisation :</p>
              <p className="text-muted-foreground">{summary.organisationName}</p>

              <p className="font-medium">Garage :</p>
              <p className="text-muted-foreground">{summary.garageName}</p>

              <p className="font-medium">Plan choisi :</p>
              <p className="text-muted-foreground capitalize">{summary.plan}</p>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Redirection vers le dashboard dans quelques secondes...
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionSummaryModal;