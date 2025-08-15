import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Eye, EyeOff, Shield, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminData } from '@/types/admin';
import { AnimatedLogo } from './AnimatedLogo';

// Constantes pour la validation
const PASSWORD_MIN_LENGTH = 8;
const PHONE_REGEX = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

export interface SuperAdminSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  isSuperAdminMode: boolean;
  adminData: AdminData;
  onAdminDataChange: (field: keyof AdminData, value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  isLoading: boolean;
  selectedPlan: string;
}

const SuperAdminSetupModal: React.FC<SuperAdminSetupModalProps> = ({ isOpen, onComplete, isSuperAdminMode }) => {
  // État du formulaire avec validation
  const [formData, setFormData] = useState({
    email: { value: '', error: '' },
    password: { value: '', error: '' },
    name: { value: '', error: '' },
    phone: { value: '', error: '' }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation en temps réel
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'email':
        return !value.includes('@') ? 'Email invalide' : '';
      case 'password':
        return value.length < PASSWORD_MIN_LENGTH ?
          `Minimum ${PASSWORD_MIN_LENGTH} caractères` : '';
      case 'phone':
        return !PHONE_REGEX.test(value) ? 'Numéro de téléphone invalide' : '';
      case 'name':
        return value.length < 2 ? 'Nom trop court' : '';
      default:
        return '';
    }
  };

  // Mise à jour des champs avec validation
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        value,
        error: validateField(field, value)
      }
    }));
  };

  // Vérification de la validité du formulaire
  const isFormValid = (): boolean => {
    return Object.values(formData).every(field => field.value && !field.error);
  };

  // Gestion de la soumission optimisée
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // 1. Création du compte Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.value,
        password: formData.password.value,
        options: {
          data: {
            name: formData.name.value,
            phone: formData.phone.value
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('User creation failed');

      // 2. Appel de la fonction stockée
      console.log('👤 Création du profil via fonction stockée...');
      const { error: profileError } = await supabase.rpc('create_profile_with_role', {
        p_id: authData.user?.id,  // Utilisez le nouveau nom de paramètre
        p_email: formData.email.value,
        p_name: formData.name.value,
        p_phone: formData.phone.value,
        p_role: 'super_admin'
      });

      if (profileError) throw profileError;

      // 3. Création Super Admin (code existant qui fonctionne)
      console.log('👑 Création entrée Super Admin...');
      const { error: adminError } = await supabase
        .from('super_admins')
        .insert([{
          user_id: authData.user.id,
          email: formData.email.value,
          name: formData.name.value,
          phone: formData.phone.value
        }])
        .select('id')
        .single();

      if (adminError) {
        console.error('❌ Erreur création super_admin:', {
          code: adminError.code,
          message: adminError.message
        });
        throw new Error('Erreur lors de la création du Super Admin');
      }

      console.log('✅ Configuration terminée avec succès');
      toast.success('Compte créé avec succès!');
      onComplete();

    } catch (error: any) {
      console.error('Erreur:', {
        message: error.message,
        code: error.code,
        details: error.details
      });

      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  // Rendu optimisé avec feedback visuel
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {/* Logo avec dégradé orange - version plus compacte */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 
                         rounded-full opacity-90 blur-xl animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-300 to-orange-500 
                         rounded-full opacity-75 blur-lg animate-pulse delay-150" />
              <div className="relative bg-black/30 p-5 rounded-full backdrop-blur-sm">
                <AnimatedLogo
                  mainIcon={Shield}
                  secondaryIcon={Key}
                  mainColor="text-white"
                  secondaryColor="text-yellow-200"
                />
              </div>
            </div>

            {/* Informations entreprise - version simplifiée */}
            <div className="text-center space-y-1">
              <p className="text-base font-medium text-gray-700">Par Thierry Gogo</p>
              <p className="text-sm font-semibold text-orange-500">FREELANCE FullStack</p>
              <p className="text-sm font-mono text-gray-600">07 58 96 61 56</p>
            </div>

            {/* Titre du modal */}
            <div className="text-center space-y-2 pt-2 border-t w-full">
              <DialogTitle className="text-xl font-bold">
                Création Super Admin
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Ce compte aura accès à toutes les organisations
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.entries(formData).map(([field, { value, error }]) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="capitalize">
                    {field}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field}
                      type={field === 'password' ? (showPassword ? 'text' : 'password') :
                        field === 'email' ? 'email' :
                          field === 'phone' ? 'tel' : 'text'}
                      value={value}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className={error ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                      required
                    />
                    {error && (
                      <span className="text-xs text-red-500 mt-1">{error}</span>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="submit"
                className="w-full"
                disabled={!isFormValid() || isSubmitting || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Création...
                  </span>
                ) : 'Créer Super Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SuperAdminSetupModal;