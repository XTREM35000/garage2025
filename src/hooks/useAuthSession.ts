import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthSessionState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuthSession = () => {
  const [authState, setAuthState] = useState<AuthSessionState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    console.log('🔐 [AuthSession] Initialisation du hook auth');

    // Fonction pour mettre à jour l'état
    const updateAuthState = (session: Session | null) => {
      console.log('🔄 [AuthSession] Mise à jour état:', {
        hasSession: !!session,
        userEmail: session?.user?.email,
        expires: session?.expires_at
      });

      setAuthState({
        user: session?.user || null,
        session: session,
        isAuthenticated: !!session?.user,
        isLoading: false
      });
    };

    // 1. Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        console.log('🔍 [AuthSession] Récupération session initiale...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [AuthSession] Erreur session initiale:', error);
        }
        
        updateAuthState(session);
      } catch (error) {
        console.error('❌ [AuthSession] Erreur critique:', error);
        updateAuthState(null);
      }
    };

    // 2. Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 [AuthSession] Événement auth:', event, {
        hasSession: !!session,
        userEmail: session?.user?.email
      });
      
      updateAuthState(session);
    });

    // Initialiser
    getInitialSession();

    // Cleanup
    return () => {
      console.log('🧹 [AuthSession] Nettoyage subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('👋 [AuthSession] Déconnexion...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ [AuthSession] Erreur déconnexion:', error);
        throw error;
      }
      console.log('✅ [AuthSession] Déconnexion réussie');
    } catch (error) {
      console.error('❌ [AuthSession] Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  const refreshSession = async () => {
    console.log('🔄 [AuthSession] Rafraîchissement session...');
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('❌ [AuthSession] Erreur rafraîchissement:', error);
        throw error;
      }
      console.log('✅ [AuthSession] Session rafraîchie');
      return session;
    } catch (error) {
      console.error('❌ [AuthSession] Erreur rafraîchissement:', error);
      throw error;
    }
  };

  return {
    ...authState,
    signOut,
    refreshSession
  };
};