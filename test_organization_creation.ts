// Test de la fonction createOrganizationWithAdmin
// À exécuter dans la console du navigateur ou dans un composant de test

import { createOrganizationWithAdmin } from '@/integrations/supabase/client';

// Fonction de test
export const testOrganizationCreation = async () => {
  try {
    console.log('🧪 Test de création d\'organisation...');

    const testData = {
      name: 'Test Organisation',
      adminEmail: `test-${Date.now()}@example.com`,
      adminName: 'Test Admin',
      plan: 'free'
    };

    console.log('📋 Données de test:', testData);

    const result = await createOrganizationWithAdmin(testData);

    console.log('✅ Test réussi !');
    console.log('📊 Résultat:', result);
    console.log('🏢 Organisation:', result.organisation);
    console.log('👤 Admin:', result.admin);
    console.log('🔑 Mot de passe:', result.tempPassword);

    return {
      success: true,
      result,
      message: 'Organisation créée avec succès'
    };

  } catch (error) {
    console.error('❌ Test échoué:', error);
    return {
      success: false,
      error,
      message: 'Échec de la création'
    };
  }
};

// Test rapide dans la console
// Copiez ceci dans la console du navigateur :
/*
import { testOrganizationCreation } from './test_organization_creation';
testOrganizationCreation().then(console.log);
*/

// Ou utilisez directement :
/*
import { createOrganizationWithAdmin } from '@/integrations/supabase/client';

createOrganizationWithAdmin({
  name: 'Mon Test Org',
  adminEmail: 'test@example.com',
  adminName: 'Test User',
  plan: 'free'
}).then(console.log).catch(console.error);
*/
