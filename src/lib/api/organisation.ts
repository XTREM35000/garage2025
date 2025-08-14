export async function submitForApproval(planId: string) {
  // Implémentation de la soumission du plan
  try {
    // Appel API vers Supabase
    return true;
  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
    return false;
  }
}