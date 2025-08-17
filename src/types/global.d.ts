export {}; // Important pour traiter le fichier comme un module

declare global {
  interface Window {
    supabase?: any; // Vous pouvez remplacer 'any' par un type plus spécifique si disponible
  }
}