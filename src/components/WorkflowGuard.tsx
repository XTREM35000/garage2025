import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthSession } from '@/hooks/useAuthSession';
import { WorkflowProvider } from '@/contexts/WorkflowProvider';
import NewInitializationWizard from '@/components/NewInitializationWizard';
import CompletionSummaryModal from '@/components/CompletionSummaryModal';
import SplashScreen from '@/components/SplashScreen';

interface WorkflowGuardProps {
  children: React.ReactNode;
}

const WorkflowGuard: React.FC<WorkflowGuardProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthSession();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        // Check if super admin exists
        const { data: superAdmins } = await supabase
          .from('super_admins')
          .select('id')
          .eq('est_actif', true);

        if (!superAdmins || superAdmins.length === 0) {
          setLoading(false);
          return;
        }

        // If authenticated and super admin exists, might be ready
        if (isAuthenticated) {
          const { data: organizations } = await supabase
            .from('organisations')
            .select('id')
            .limit(1);

          if (organizations && organizations.length > 0) {
            setIsReady(true);
          }
        }
      } catch (error) {
        console.error('Setup check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSetup();
  }, [isAuthenticated]);

  const handleWorkflowComplete = () => {
    setIsCompleted(true);
  };

  const handleSummaryClose = () => {
    setIsReady(true);
    navigate('/dashboard');
  };

  if (loading) {
    return <SplashScreen visible onComplete={() => setLoading(false)} />;
  }

  if (isCompleted) {
    return (
      <CompletionSummaryModal
        isOpen={true}
        onClose={handleSummaryClose}
      />
    );
  }

  if (isReady) {
    return children;
  }

  return (
    <WorkflowProvider>
      <NewInitializationWizard
        isOpen={true}
        onComplete={handleWorkflowComplete}
      />
    </WorkflowProvider>
  );
};

export default WorkflowGuard;