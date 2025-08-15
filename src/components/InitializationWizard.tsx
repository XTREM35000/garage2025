import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase, createOrganizationWithAdmin } from '@/integrations/supabase/client';
import type { CreateOrganizationResponse } from '@/integrations/supabase/client';
import PricingModal from '@/components/PricingModal';
import GarageSetupModal from '@/components/GarageSetupModal';
import SmsValidationModal from '@/components/SmsValidationModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, User, Mail, Key, Phone, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SuperAdminSetupModal from '@/components/SuperAdminSetupModal';


interface InitializationWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  startStep: 'pricing' | 'create-admin' | 'super-admin';
  mode?: 'super-admin' | 'normal'
}

type WizardStep =
  | 'super-admin'
  | 'pricing'
  | 'create-admin'
  | 'create-organization'
  | 'sms-validation'
  | 'garage-setup'
  | 'complete';

interface AdminData {
  email: string;
  password: string;
  phone: string;
  name: string;
  avatarFile?: File | null; // Optionnel pour l'avatar
}

interface OrganizationData {
  name: string;
  slug: string;
  code?: string;
  selectedPlan: string;
}

const completeInitialization = async () => {
  const { error } = await supabase
    .from('onboarding_workflow_states')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
      current_step: 'completed'
    })
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

  if (error) throw error;
};

const notifySuccess = (message: string) => {
  toast.success(message);
};

const notifyError = (message: string) => {
  toast.error(message);
};

const InitializationWizard: React.FC<InitializationWizardProps> = ({
  isOpen,
  onComplete,
  startStep,
  mode = 'normal'
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(startStep === 'super-admin' ? 'super-admin' : startStep);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminData, setAdminData] = useState<AdminData>({
    email: '',
    password: '',
    phone: '',
    name: '',
    avatarFile: null

  });
  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    name: '',
    slug: '',
    selectedPlan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Gestion du Super-Admin
  const handleSuperAdminCreated = () => {
    console.log('✅ Super-Admin créé, passage à la création de l\'admin d\'organisation');
    // Après super-admin, afficher le plan tarifaire
    setCurrentStep('pricing');
  };

  // Gestion du Pricing (optionnel - peut être sauté) 
  const handlePlanSelection = (planId: string) => {
    console.log('✅ Plan sélectionné:', planId);
    setOrganizationData(prev => ({ ...prev, selectedPlan: planId }));
    // Après le choix du plan, passer à la création de l'admin
    setCurrentStep('create-admin');
  };

  // Gestion de la création de l'admin
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('🚀 Début création admin/super-admin, mode:', mode, 'currentStep:', currentStep);

    try {
      // Traitement spécial pour Super Admin
      if (mode === 'super-admin' || currentStep === 'super-admin') {
        console.log('🦸‍♂️ Mode Super Admin détecté, création en cours...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: adminData.email,
          password: adminData.password,
          options: {
            data: {
              full_name: adminData.name,
              phone: adminData.phone
            }
          }
        });

        if (signUpError || !signUpData.user) {
          throw new Error(signUpError?.message || 'Échec création du compte');
        }

        // Créer profil
        await supabase.from('profiles').upsert({
          id: signUpData.user.id,
          email: adminData.email,
          full_name: adminData.name,
          phone: adminData.phone,
          role: 'admin'
        });

        // Créer Super Admin
        await supabase.from('super_admins').insert({
          user_id: signUpData.user.id,
          email: adminData.email,
          nom: adminData.name.split(' ')[1] || '',
          prenom: adminData.name.split(' ')[0] || '',
          phone: adminData.phone
        });

        toast.success('Super Admin créé avec succès!');
        onComplete();
        return;
      }
      // 1. Vérifier si l'utilisateur existe
      const { data: { user: existingUser }, error: getUserError } = await supabase.auth.getUser();

      // Si un utilisateur est déjà connecté, passer directement à la création de l'organisation
      if (existingUser) {
        console.log('✅ Utilisateur déjà connecté');
        setCurrentStep('create-organization');
        setIsLoading(false);
        return;
      }

      // 2. Essayer de se connecter d'abord
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminData.email,
        password: adminData.password
      });

      if (!signInError && signInData.user) {
        console.log('✅ Connexion réussie avec compte existant');
        setCurrentStep('create-organization');
        setIsLoading(false);
        return;
      }

      // 3. Si la connexion échoue, créer un nouveau compte
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: {
            full_name: adminData.name,
            phone: adminData.phone
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('Échec création du compte');
      }

      // 2. Upload avatar (optionnel)
      let avatarUrl = null;
      if (adminData.avatarFile && signUpData.user) {
        const fileExt = adminData.avatarFile.name.split('.').pop();
        const filePath = `${signUpData.user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, adminData.avatarFile);

        if (!uploadError) {
          avatarUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
        }
      }

      // 3. Mise à jour du profil pour le nouvel utilisateur
      const currentUser = signUpData.user;
      if (currentUser) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: currentUser.id,
            email: adminData.email,
            user_id: currentUser.id,
            full_name: adminData.name,
            phone: adminData.phone,
            avatar_url: avatarUrl,
            role: 'admin'
          });

        if (profileError) throw profileError;
      }

      toast.success('Compte créé avec succès!');
      setCurrentStep('create-organization');

    } catch (error) {
      console.error('Erreur:', error);
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Mot de passe incorrect. Si vous avez un compte, vérifiez vos identifiants.');
      } else if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        // Réessayer la connexion
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: adminData.email,
            password: adminData.password
          });

          if (!signInError && signInData.user) {
            toast.success('Connexion réussie avec compte existant');
            setCurrentStep('create-organization');
            return;
          }

          toast.error('Cet email est déjà utilisé. Veuillez utiliser un autre email ou vous connecter.');
        } catch {
          toast.error('Erreur de connexion. Vérifiez vos identifiants.');
        }
      } else {
        toast.error('Une erreur technique est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la création de l'organisation
  const generateOrgCode = () => {
    // Code fixe pour la démo
    return 'ORG012025';
  };

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // 1. Création de l'organisation
      const { data, error } = await supabase.rpc('create_organisation_with_admin', {
        org_name: organizationData.name,
        org_subscription_plan: organizationData.selectedPlan,
        org_code: generateOrgCode(),
        is_demo: true,
        admin_id: user.id
      });

      if (error) throw error;

      if (!data.organisation_id) {
        throw new Error('ID organisation manquant dans la réponse');
      }

      // 2. Mettre à jour le workflow state avant le profil
      await supabase.from('onboarding_workflow_states').upsert({
        user_id: user.id,
        organisation_id: data.organisation_id,
        current_step: 'sms-validation',
        updated_at: new Date().toISOString()
      });

      // 3. Mise à jour du profil utilisateur en dernier
      await supabase.from('profiles').update({
        organisation_id: data.organisation_id,
        role: 'admin'
      }).eq('id', user.id);

      // 4. UI updates
      toast.success('Organisation créée avec succès!');
      setCurrentStep('sms-validation');
      setOrganizationData(prev => ({
        ...prev,
        code: data.code || generateOrgCode(),
        id: data.organisation_id
      }));

    } catch (error: any) {
      console.error('❌ Erreur création organisation:', error);
      toast.error(`Erreur création organisation: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions de gestion des inputs
  const handleAdminInputChange = (field: keyof AdminData, value: string) => {
    setAdminData(prev => ({ ...prev, [field]: value }));
  };

  const handleOrganizationInputChange = (field: keyof OrganizationData, value: string) => {
    setOrganizationData(prev => ({ ...prev, [field]: value }));
  };

  // Gestion du setup garage
  const handleGarageSetup = async (garageData: any) => {
    console.log('✅ Garage configuré:', garageData);

    // Ici on pourrait sauvegarder les données du garage
    toast.success('Configuration du garage terminée!');
    setCurrentStep('complete');

    // Rediriger vers l'authentification après un délai
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  // Gestion de la validation SMS après création d'organisation
  const handleSmsValidate = async () => {
    // En validation réussie (code 123456 dans le modal), continuer le flux
    setCurrentStep('garage-setup');
  };

  const handleSmsRefuse = () => {
    // Si refus, on peut tout de même continuer ou revenir en arrière. On continue pour ne pas bloquer.
    setCurrentStep('garage-setup');
  };

  // Gestion de la finalisation
  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeInitialization();

      // Attendre que la mise à jour soit terminée
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Forcer un rechargement de la page pour réinitialiser l'état
      window.location.href = '/organizations/select';

      notifySuccess('Installation terminée avec succès');
    } catch (error) {
      notifyError("Erreur lors de la finalisation de l'installation");
      console.error(error);
    }
    setIsSubmitting(false);
  };


  // Rendu selon l'étape
  // Rendu selon l'étape
  switch (currentStep) {
    case 'pricing':
      return (
        <PricingModal
          isOpen={isOpen}
          onSelectPlan={handlePlanSelection}
        />
      );

    case 'super-admin':
      return (
        <SuperAdminSetupModal
          isOpen={isOpen}
          onComplete={handleSuperAdminCreated}
          isSuperAdminMode={true}
          adminData={adminData}
          onAdminDataChange={handleAdminInputChange}
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword(!showPassword)}
          isLoading={isLoading}
          selectedPlan={organizationData.selectedPlan}
        />
      );

    case 'create-admin':
      return (
        <SuperAdminSetupModal
          isOpen={isOpen}
          onComplete={() => setCurrentStep('create-organization')}
          isSuperAdminMode={false}
          adminData={adminData}
          onAdminDataChange={handleAdminInputChange}
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword(!showPassword)}
          isLoading={isLoading}
          selectedPlan={organizationData.selectedPlan}
        />
      );

    case 'create-organization':
      return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
          <DialogContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            aria-describedby="organisation-form-description"
          >
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Création de l'Organisation
              </DialogTitle>
              <DialogDescription id="organisation-form-description" className="text-center">
                Configurez votre organisation avec les informations de base.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleOrganizationSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informations de l'organisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="organisationName">Nom de l'organisation *</Label>
                    <Input
                      id="organisationName"
                      value={organizationData.name}
                      onChange={(e) => handleOrganizationInputChange('name', e.target.value)}
                      placeholder="Ex: Garage Central Abidjan"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="organisationSlug">Identifiant unique (slug)</Label>
                    <Input
                      id="organisationSlug"
                      value={organizationData.slug}
                      onChange={(e) => handleOrganizationInputChange('slug', e.target.value)}
                      placeholder="garage-central-abidjan (généré automatiquement)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Utilisé pour l'URL. Laissez vide pour génération automatique.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Informations
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Votre organisation sera créée avec le plan sélectionné</li>
                  <li>• Vous serez automatiquement associé comme propriétaire</li>
                  <li>• Plan sélectionné: <span className="font-semibold">{organizationData.selectedPlan}</span></li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !organizationData.name}
              >
                {isLoading ? 'Création en cours...' : 'Créer l\'organisation'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      );

    case 'sms-validation':
      return (
        <SmsValidationModal
          isOpen={isOpen}
          onClose={() => { }}
          onValidate={handleSmsValidate}
          onRefuse={handleSmsRefuse}
          organizationCode={organizationData.code}
          organizationName={organizationData.name}
          adminName={adminData.name}
        />
      );

    case 'garage-setup':
      return (
        <GarageSetupModal
          isOpen={isOpen}
          onComplete={handleGarageSetup}
        />
      );

    case 'complete':
      return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
          <DialogContent className="max-w-md text-center">
            <DialogHeader>
              <DialogTitle className="text-xl text-green-600">
                🎉 Configuration Terminée !
              </DialogTitle>
              <DialogDescription>
                Votre organisation et votre compte administrateur ont été créés avec succès.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Votre organisation et votre compte administrateur ont été créés avec succès.
              </p>
              <p className="text-sm text-blue-600">
                Redirection vers la page d'authentification...
              </p>
            </div>
          </DialogContent>
        </Dialog>
      );

    default:
      return null;
  }
};

export default InitializationWizard;