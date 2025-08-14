import { supabase } from '@/integrations/supabase/client';

/**
 * Nettoie complètement l'état de l'application
 * Utile pour résoudre les problèmes de session corrompue
 */
export const cleanApplicationState = async () => {
  try {
    console.log('🧹 Début du nettoyage de l\'état de l\'application...');

    // 1. Déconnexion de Supabase
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('❌ Erreur lors de la déconnexion:', signOutError);
    } else {
      console.log('✅ Déconnexion Supabase réussie');
    }

    // 2. Nettoyer le localStorage
    const keysToRemove = [
      'current_org',
      'org_code',
      'supabase.auth.token',
      'supabase.auth.expires_at',
      'supabase.auth.refresh_token',
      'supabase.auth.expires_in',
      'supabase.auth.provider_token',
      'supabase.auth.provider_refresh_token',
      'supabase.auth.access_token',
      'supabase.auth.user',
      'supabase.auth.session'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    console.log('✅ LocalStorage et SessionStorage nettoyés');

    // 3. Nettoyer les cookies liés à Supabase
    const cookiesToRemove = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase.auth.token'
    ];

    cookiesToRemove.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    console.log('✅ Cookies nettoyés');

    // 4. Vérifier que tout est bien nettoyé
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    if (!session && !user) {
      console.log('✅ État complètement nettoyé');
      return true;
    } else {
      console.warn('⚠️ État pas complètement nettoyé, session ou utilisateur encore présent');
      return false;
    }

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return false;
  }
};

/**
 * Force le rechargement de l'application après nettoyage
 */
export const forceReload = () => {
  console.log('🔄 Rechargement forcé de l\'application...');
  window.location.reload();
};

/**
 * Redirige vers la page d'authentification
 */
export const redirectToAuth = () => {
  console.log('🔀 Redirection vers la page d\'authentification...');
  window.location.href = '/auth';
};

/**
 * Résout automatiquement les problèmes de session
 */
export const resolveSessionIssues = async () => {
  console.log('🔧 Résolution automatique des problèmes de session...');

  const cleaned = await cleanApplicationState();

  if (cleaned) {
    console.log('✅ Problèmes résolus, redirection vers auth');
    redirectToAuth();
  } else {
    console.log('⚠️ Problèmes non complètement résolus, rechargement forcé');
    forceReload();
  }
};

/**
 * Vérifie si l'état de l'application est cohérent
 */
export const checkApplicationState = () => {
  const state = {
    localStorage: {
      currentOrg: localStorage.getItem('current_org'),
      orgCode: localStorage.getItem('org_code'),
    },
    sessionStorage: {
      hasAuthData: !!sessionStorage.getItem('supabase.auth.token'),
    },
    cookies: {
      hasAuthCookies: document.cookie.includes('sb-access-token') || document.cookie.includes('supabase.auth.token'),
    }
  };

  console.log('📊 État de l\'application:', state);
  return state;
};
