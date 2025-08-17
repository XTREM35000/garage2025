import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.generated.types';

// Configuration directe (solution la plus simple)
const SUPABASE_URL = 'https://metssugfqsnttghfrsxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHNzdWdmcXNudHRnaGZyc3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDk5NjEsImV4cCI6MjA2ODQyNTk2MX0.Vc0yDgzSe6iAfgUHezVKQMm4qvzMRRjCIrTTndpE1k8';

// Solution alternative avec import.meta.env (si vous utilisez Vite)
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    // auth: {
    //   storage: typeof window !== 'undefined' ? localStorage : undefined,
    //   persistSession: true,
    //   autoRefreshToken: true,
    //   detectSessionInUrl: false
    // },
    db: {
      schema: 'public'
    }
  }
);

// // Logger amélioré
// supabase.auth.onAuthStateChange((event, session) => {
//   const userEmail = session?.user?.email || 'no-user';
//   console.log(`[Supabase Auth] ${event} - User: ${userEmail}`);
// });

// Extension pour le debug
if (import.meta.env.DEV) {
  window.supabase = supabase; // Expose supabase client globalement en développement
}