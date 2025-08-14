// Exemple de mise à jour pour InitializationWizard.tsx
// Remplacez votre code existant par cette version

import React, { useState } from 'react';
import { createOrganizationWithAdmin } from '@/integrations/supabase/client';

interface FormData {
  orgName: string;
  adminEmail: string;
  adminName: string;
  plan: string;
}

const InitializationWizard = () => {
  const [formData, setFormData] = useState<FormData>({
    orgName: '',
    adminEmail: '',
    adminName: '',
    plan: 'monthly'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const handleOrganizationAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔍 Tentative création organisation avec données:', {
        name: formData.orgName,
        adminEmail: formData.adminEmail,
        adminName: formData.adminName,
        plan: formData.plan
      });

      // Utiliser la nouvelle fonction RPC
      const result = await createOrganizationWithAdmin({
        name: formData.orgName,
        adminEmail: formData.adminEmail,
        adminName: formData.adminName,
        plan: formData.plan
      });

      console.log('✅ Organisation créée avec succès:', result);

      setSuccess({
        organisation: result.organisation,
        admin: result.admin,
        tempPassword: result.tempPassword
      });

      // Afficher le mot de passe à l'utilisateur
      alert(`Organisation créée avec succès !\n\nDétails:\n- Organisation: ${result.organisation.name}\n- Admin: ${result.admin.full_name}\n- Email: ${result.admin.email}\n- Mot de passe temporaire: ${result.tempPassword}\n\nVeuillez noter ce mot de passe !`);

      // Optionnel : Rediriger vers le dashboard
      // router.push('/dashboard');

    } catch (error: any) {
      console.error('❌ Erreur création organisation:', error);
      setError(error.message || 'Une erreur est survenue lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Créer votre organisation
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ Organisation créée avec succès !
          <br />
          <strong>Mot de passe temporaire:</strong> {success.tempPassword}
        </div>
      )}

      <form onSubmit={handleOrganizationAdminSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'organisation *
          </label>
          <input
            type="text"
            value={formData.orgName}
            onChange={(e) => handleInputChange('orgName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Mon Garage"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'administrateur *
          </label>
          <input
            type="text"
            value={formData.adminName}
            onChange={(e) => handleInputChange('adminName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email de l'administrateur *
          </label>
          <input
            type="email"
            value={formData.adminEmail}
            onChange={(e) => handleInputChange('adminEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admin@monorg.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan d'abonnement
          </label>
          <select
            value={formData.plan}
            onChange={(e) => handleInputChange('plan', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="free">Gratuit</option>
            <option value="monthly">Mensuel</option>
            <option value="yearly">Annuel</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Création en cours...
            </span>
          ) : (
            'Créer l\'organisation'
          )}
        </button>
      </form>

      {success && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold mb-2">Informations de connexion :</h3>
          <div className="text-sm space-y-1">
            <p><strong>Email:</strong> {success.admin.email}</p>
            <p><strong>Mot de passe:</strong> {success.tempPassword}</p>
            <p className="text-red-600 font-medium">
              ⚠️ Notez bien ce mot de passe, il ne sera plus affiché !
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InitializationWizard;
