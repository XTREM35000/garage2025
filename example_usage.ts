// Exemple d'utilisation de createOrganizationWithAdmin
// À utiliser dans vos composants React

import { createOrganizationWithAdmin } from '@/integrations/supabase/client';
import { useState } from 'react';

// Dans votre modal de création d'organisation
const handleSubmit = async () => {
  try {
    // 1. Préparer les données du formulaire
    const formData = {
      name: 'Mon Organisation',
      adminEmail: 'admin@monorg.com',
      adminName: 'John Doe',
      plan: 'monthly' // ou 'yearly', 'free', etc.
    };

    // 2. Appel à la fonction
    const result = await createOrganizationWithAdmin(formData);

    // 3. Gérer le succès
    console.log('✅ Organisation créée:', result.organisation);
    console.log('✅ Admin créé:', result.admin);
    console.log('🔑 Mot de passe temporaire:', result.tempPassword);

    // 4. Optionnel : Connecter automatiquement l'admin
    // await supabase.auth.signInWithPassword({
    //   email: result.admin.email,
    //   password: result.tempPassword
    // });

    // 5. Afficher le mot de passe à l'utilisateur
    alert(`Organisation créée avec succès !\nMot de passe temporaire: ${result.tempPassword}`);

    // 6. Rediriger ou fermer le modal
    // router.push('/dashboard');
    // setModalOpen(false);

  } catch (error) {
    console.error('❌ Erreur création:', error);

    // Gérer l'erreur dans votre UI
    alert(`Erreur lors de la création: ${error.message}`);
  }
};

// Exemple avec gestion d'état React
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleCreateOrganization = async (formData: any) => {
  setIsLoading(true);
  setError(null);

  try {
    const result = await createOrganizationWithAdmin({
      name: formData.orgName,
      adminEmail: formData.adminEmail,
      adminName: formData.adminName,
      plan: formData.plan
    });

    // Succès
    console.log('Organisation créée:', result);

    // Mettre à jour l'état de votre application
    // setOrganizations(prev => [...prev, result.organisation]);

  } catch (error: any) {
    setError(error.message);
    console.error('Erreur:', error);
  } finally {
    setIsLoading(false);
  }
};

// Exemple de formulaire React
const OrganizationForm = () => {
  const [formData, setFormData] = useState({
    orgName: '',
    adminEmail: '',
    adminName: '',
    plan: 'monthly'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateOrganization(formData);
  };

  return (
    <form onSubmit= { handleSubmit } >
    <input
        type="text"
  placeholder = "Nom de l'organisation"
  value = { formData.orgName }
  onChange = {(e) => setFormData(prev => ({ ...prev, orgName: e.target.value }))}
required
  />

  <input
        type="email"
placeholder = "Email de l'admin"
value = { formData.adminEmail }
onChange = {(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
required
  />

  <input
        type="text"
placeholder = "Nom de l'admin"
value = { formData.adminName }
onChange = {(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
required
  />

  <select
        value={ formData.plan }
onChange = {(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
      >
  <option value="free" > Gratuit </option>
    < option value = "monthly" > Mensuel </option>
      < option value = "yearly" > Annuel </option>
        </select>

        < button type = "submit" disabled = { isLoading } >
          { isLoading? 'Création...': 'Créer l\'organisation' }
          </button>

{ error && <div className="error" > { error } </div> }
</form>
  );
};
