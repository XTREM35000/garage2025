import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SplashScreen from './SplashScreen';

export default function WorkflowGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Création automatique d'un super admin si aucun utilisateur
        const { error } = await supabase.auth.signUp({
          email: 'admin@example.com',
          password: 'securepassword'
        });

        if (error) {
          console.error('Auto-creation failed:', error);
          return;
        }
      }

      setLoading(false);
      navigate('/dashboard'); // Redirection directe
    };

    checkAuth();
  }, []);

  if (loading) return <SplashScreen onComplete={() => setLoading(false)} />;

  return children;
}