import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function EmergencyBypass() {
  const navigate = useNavigate();

  useEffect(() => {
    const bypassSetup = async () => {
      await supabase.auth.signInWithPassword({
        email: 'admin@example.com',
        password: 'securepassword'
      });
      navigate('/dashboard');
    };

    bypassSetup();
  }, []);

  return <div>Bypassing setup...</div>;
}

