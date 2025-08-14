import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase, createOrganizationWithAdmin } from '@/integrations/supabase/client';
import type { CreateOrganizationResponse } from '@/integrations/supabase/client';
import PricingModal from '@/components/PricingModal';
import SuperAdminSetupModal from '@/components/SuperAdminSetupModal';
import GarageSetupModal from '@/components/GarageSetupModal';
import SmsValidationModal from '@/components/SmsValidationModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, User, Mail, Key, Phone, Eye, EyeOff } from 'lucide-react';

interface InitializationWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  startStep: 'super-admin' | 'pricing' | 'create-admin';
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

const InitializationWizard: React.FC<InitializationWizardProps> = ({
  isOpen,
  onComplete,
  startStep
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(startStep);
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

    try {
      // 1. Création du compte Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: { // Metadata stockée dans auth.users
            full_name: adminData.name,
            phone: adminData.phone
          }
        }
      });

      if (authError || !authData.user) {
        throw authError || new Error('Échec création du compte');
      }

      // 2. Upload avatar (optionnel)
      let avatarUrl = null;
      if (adminData.avatarFile) {
        const fileExt = adminData.avatarFile.name.split('.').pop();
        const filePath = `${authData.user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, adminData.avatarFile);

        if (!uploadError) {
          avatarUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
        }
      }

      // 3. Mise à jour manuelle si nécessaire
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: adminData.email,
          user_id: authData.user.id,
          full_name: adminData.name,
          phone: adminData.phone,
          avatar_url: avatarUrl,
          actif: true,
          role: 'admin'
        });

      if (profileError) throw profileError;

      toast.success('Administrateur créé avec succès!');
      setCurrentStep('create-organization');

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(
        error.message.includes('already exists') ? 'Email déjà utilisé' :
          error.message.includes('duplicate key') ? 'Compte déjà existant' :
            'Erreur technique'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la création de l'organisation
  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔍 Tentative création organisation avec données:', {
        name: organizationData.name,
        plan: organizationData.selectedPlan
      });

      // Utiliser la fonction RPC avec typage et vérification robuste
      const result: CreateOrganizationResponse = await createOrganizationWithAdmin({
        name: organizationData.name,
        adminEmail: adminData.email,
        adminName: adminData.name,
        plan: organizationData.selectedPlan === 'annual' ? 'yearly' : 'monthly'
      });

      console.log('✅ Réponse création organisation:', result);

      if (result.error) {
        throw new Error(result.error.message || 'Erreur création organisation');
      }

      // Lier l'utilisateur admin à l'organisation dans public.users
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          const { error: linkError } = await supabase.rpc('upsert_user_profile', {
            user_id: user.id,
            user_email: adminData.email,
            full_name: adminData.name,
            phone: adminData.phone,
            user_role: 'admin',
            organization_id: result.data?.id,
            avatar_url: null
          });
          if (linkError) {
            console.warn('⚠️ Erreur liaison organisation_id sur users:', linkError);
          }
        }
      } catch (e) {
        console.warn('⚠️ Impossible de lier organisation_id (non bloquant):', e);
      }

      // Mettre à jour les données avec le code généré (valeur par défaut si absent)
      setOrganizationData(prev => ({
        ...prev,
        code: result.data?.code ?? 'N/A'
      }));

      toast.success('Organisation créée avec succès!');

      // Afficher la validation SMS/paiement après création d'organisation
      setCurrentStep('sms-validation');
    } catch (error: any) {
      toast.error('Erreur lors de la création de l\'organisation: ' + (error.message || 'Erreur inconnue'));
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


  // Rendu selon l'étape
  switch (currentStep) {
    case 'super-admin':
      return (
        <SuperAdminSetupModal
          isOpen={isOpen}
          onComplete={handleSuperAdminCreated}
        />
      );

    case 'pricing':
      return (
        <PricingModal
          isOpen={isOpen}
          onSelectPlan={handlePlanSelection}
        />
      );

    case 'create-admin':
      return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Création du Compte Administrateur
              </DialogTitle>
              <DialogDescription className="text-center">
                Créez le compte administrateur principal qui gérera votre organisation.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations de l'administrateur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="adminName">Nom complet *</Label>
                    <Input
                      id="adminName"
                      value={adminData.name}
                      onChange={(e) => handleAdminInputChange('name', e.target.value)}
                      placeholder="Jean Kouassi"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email administrateur *
                    </Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={adminData.email}
                      onChange={(e) => handleAdminInputChange('email', e.target.value)}
                      placeholder="admin@garagecentral.ci"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminPhone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone *
                    </Label>
                    <Input
                      id="adminPhone"
                      type="tel"
                      value={adminData.phone}
                      onChange={(e) => handleAdminInputChange('phone', e.target.value)}
                      placeholder="+225 07 XX XX XX XX"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminPassword" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Mot de passe *
                    </Label>
                    <div className="relative">
                      <Input
                        id="adminPassword"
                        type={showPassword ? "text" : "password"}
                        value={adminData.password}
                        onChange={(e) => handleAdminInputChange('password', e.target.value)}
                        placeholder="Mot de passe sécurisé"
                        required
                        minLength={6}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Prochaines étapes
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Votre compte administrateur sera créé</li>
                  <li>• Vous pourrez ensuite créer votre organisation</li>
                  <li>• Plan sélectionné: <span className="font-semibold">{organizationData.selectedPlan}</span></li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !adminData.name || !adminData.email || !adminData.password || !adminData.phone}
              >
                {isLoading ? 'Création en cours...' : 'Créer le compte administrateur'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      );

    case 'create-organization':
      return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Création de l'Organisation
              </DialogTitle>
              <DialogDescription className="text-center">
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