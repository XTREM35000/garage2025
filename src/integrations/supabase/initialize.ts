import { supabase } from './client';

export async function initializeSaaSSchema() {
  const { error } = await supabase.rpc('initialize_saas_schema');
  if (error) throw new Error(`SaaS schema init failed: ${error.message}`);
  return true;
}