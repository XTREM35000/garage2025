import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface SimpleAuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useSimpleAuth = () => {
  const [authState, setAuthState] = useState<SimpleAuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        setAuthState({
          user: session?.user || null,
          isAuthenticated: !!session?.user,
          isLoading: false
        });
      } catch (error) {
        console.error('Auth error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthState({
        user: session?.user || null,
        isAuthenticated: !!session?.user,
        isLoading: false
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...authState,
    signOut
  };
};