import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, User, Key, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PricingModal from '@/components/PricingModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onComplete: (organisationId: string) => void;
  plan?: string;
  showPricingFirst?: boolean;
}

export const OrganisationOnboarding: React.FC<Props> = ({
  isOpen,
  onComplete,
  plan,
  showPricingFirst = false
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(showPricingFirst ? 'pricing' : 'organisation');
  const [selectedPlan, setSelectedPlan] = useState(plan || 'free');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    nom: '',
    slug: '',
    adminEmail: '',
    adminPassword: ''
  });
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.adminEmail) {
      newErrors.adminEmail = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = "Format d'email invalide";
    }

    if (!formData.adminPassword) {
      newErrors.adminPassword = 'Le mot de passe est requis';
    } else if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = 'Minimum 8 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    setCurrentStep('organisation');
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // 1. Créer l'utilisateur admin
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.adminPassword,
        options: {
          data: {
            full_name: `Admin ${formData.nom}`,
            role: 'admin'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte administrateur');

      // 2. Créer l'organisation
      const slug = formData.slug || generateSlug(formData.nom);
      const code = slug.toUpperCase().substring(0, 6) + Date.now().toString().slice(-4);

      const { data: orgData, error: orgError } = await supabase
        .from('organisations')
        .insert({
          name: formData.nom,
          code,
          slug,
          email: formData.adminEmail,
          subscription_type: selectedPlan === 'annual' ? 'lifetime' : 'monthly',
          is_active: true,
          created_by: authData.user.id
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 3. Lier l'utilisateur à l'organisation
      const { error: userError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authData.user.id,
          full_name: `Admin ${formData.nom}`,
          email: formData.adminEmail,
          role: 'admin',
          is_active: true,
          organisation_id: orgData.id
        });

      if (userError) throw userError;

      toast({
        title: 'Organisation créée avec succès',
        description: `L'organisation ${formData.nom} et le compte administrateur ont été créés.`
      });

      onComplete(orgData.id);
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Erreur complète:', error);
      toast({
        title: 'Erreur lors de la création',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (currentStep === 'pricing') {
    return <PricingModal isOpen={isOpen} onSelectPlan={handlePlanSelection} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Créer votre organisation
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations de l'organisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom de l'organisation *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  placeholder="Ex: Garage Central Abidjan"
                  className={errors.nom ? 'border-destructive' : ''}
                />
                {errors.nom && <p className="text-destructive text-sm mt-1">{errors.nom}</p>}
              </div>

              <div>
                <Label htmlFor="slug">Identifiant unique (slug)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder={generateSlug(formData.nom) || "garage-central-abidjan"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Utilisé pour l'URL. Laissez vide pour génération automatique.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Compte administrateur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adminEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email administrateur *
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                  placeholder="admin@garagecentral.ci"
                  className={errors.adminEmail ? 'border-destructive' : ''}
                />
                {errors.adminEmail && <p className="text-destructive text-sm mt-1">{errors.adminEmail}</p>}
              </div>

              <div>
                <Label htmlFor="adminPassword" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Mot de passe *
                </Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                  placeholder="Mot de passe sécurisé"
                  className={errors.adminPassword ? 'border-destructive' : ''}
                />
                {errors.adminPassword && <p className="text-destructive text-sm mt-1">{errors.adminPassword}</p>}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Plan sélectionné : <span className="font-semibold capitalize">{selectedPlan}</span>
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">↻</span>
                Création en cours...
              </span>
            ) : (
              'Créer mon organisation'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
