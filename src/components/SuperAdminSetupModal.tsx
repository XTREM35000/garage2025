import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Eye, EyeOff, Shield, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminData, AdminMode } from '@/types/admin';
import { AnimatedLogo } from './AnimatedLogo';
import '../styles/whatsapp-theme.css';
import { useWorkflow } from '@/contexts/WorkflowProvider'; // Ajout de l'import
import { EmailField } from '@/components/ui/email-field';

// Constantes pour la validation
const PASSWORD_MIN_LENGTH = 8;
const PHONE_REGEX = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

export interface SuperAdminSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  mode: AdminMode;
  adminData: AdminData;
  onAdminDataChange: (field: keyof AdminData, value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  isLoading: boolean;
  selectedPlan?: string;
}

const SuperAdminSetupModal: React.FC<SuperAdminSetupModalProps> = ({
  isOpen,
  onComplete,
  mode,
  adminData,
  onAdminDataChange,
  showPassword,
  onToggleShowPassword,
  isLoading,
  selectedPlan
}) => {
  const { completeStep } = useWorkflow(); // Récupération de completeStep depuis le context

  // Ajout du state error
  const [error, setError] = useState<string>('');

  // État du formulaire avec validation
  const [formData, setFormData] = useState({
    email: { value: '', error: '', isValid: false },
    password: { value: '', error: '', isValid: false },
    name: { value: '', error: '', isValid: false },
    phone: { value: '', error: '', isValid: false }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Validation en temps réel
  const validateField = (field: string, value: string): { error: string; isValid: boolean } => {
    switch (field) {
      case 'email':
        // Nouvelle validation spécifique gmail
        const emailRegex = /^[a-z0-9._-]+@gmail\.com$/;
        const emailValid = emailRegex.test(value);
        return {
          error: emailValid ? '' : 'Format email invalide',
          isValid: emailValid
        };
      case 'password':
        const passwordValid = value.length >= PASSWORD_MIN_LENGTH;
        return {
          error: passwordValid ? '' : `Minimum ${PASSWORD_MIN_LENGTH} caractères`,
          isValid: passwordValid
        };
      case 'phone':
        const phoneValid = value === '' || PHONE_REGEX.test(value);
        return {
          error: phoneValid ? '' : 'Numéro de téléphone invalide',
          isValid: phoneValid
        };
      case 'name':
        const nameValid = value.length >= 2;
        return {
          error: nameValid ? '' : 'Nom trop court (minimum 2 caractères)',
          isValid: nameValid
        };
      default:
        return { error: '', isValid: false };
    }
  };

  // Mise à jour des champs avec validation
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        value,
        error: '',
        isValid: true
      }
    }));

    // Mettre à jour adminData pour la compatibilité
    onAdminDataChange(field as keyof AdminData, value);
  };

  // Vérification de la validité du formulaire
  const isFormValid = (): boolean => {
    return Object.values(formData).every(field => field.value && field.isValid);
  };

  // Gestion de la soumission optimisée - Nouvelle version en 2 étapes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      console.log('🚀 Tentative création super admin...');

      // Extraction des valeurs propres
      const email = formData.email.value;
      const password = formData.password.value;
      const name = formData.name.value;

      // Appel RPC avec les bonnes valeurs
      const { data, error } = await supabase.rpc('create_super_admin', {
        p_email: email,
        p_password: password,
        p_name: name
      });

      console.log('📦 Réponse RPC:', data);

      if (error || !data?.success) {
        throw new Error(data?.message || error?.message || 'Échec de la création');
      }

      // Connexion automatique
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (signInError) {
        throw signInError;
      }

      // Notification et mise à jour workflow
      toast.success('Super administrateur créé avec succès!');
      await completeStep('super_admin_check');

      // Afficher message succès avant redirection
      setShowSuccessMessage(true);

      // Délai court avant complétion
      setTimeout(() => {
        onComplete();
      }, 1500);

    } catch (error: any) {
      console.error('❌ Erreur création:', error);
      setError(error.message || 'Erreur lors de la création');
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: { value: '', error: '', isValid: false },
        password: { value: '', error: '', isValid: false },
        name: { value: '', error: '', isValid: false },
        phone: { value: '', error: '', isValid: false }
      });
      setShowSuccessMessage(false);
    }
  }, [isOpen]);

  const modalTitle = mode === 'super-admin' ? 'Création Super Admin' : 'Création Admin Standard';
  const submitButtonText = mode === 'super-admin' ? 'Créer Super Admin' : 'Créer Admin Standard';

  if (showSuccessMessage) {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Compte créé avec succès !
            </h3>
            <p className="text-sm text-gray-500">
              Redirection en cours...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        <div className="modal-whatsapp-card">
          {/* Header avec gradient WhatsApp */}
          <div className="modal-whatsapp-header">
            <div className="flex flex-col items-center gap-4">
              {/* Logo avec dégradé orange */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 
                           rounded-full opacity-90 blur-xl animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-300 to-orange-500 
                           rounded-full opacity-75 blur-lg animate-pulse delay-150" />
                <div className="relative bg-black/30 p-4 rounded-full backdrop-blur-sm">
                  <AnimatedLogo
                    mainIcon={Shield}
                    secondaryIcon={Key}
                    mainColor="text-white"
                    secondaryColor="text-yellow-200"
                  />
                </div>
              </div>

              {/* Informations entreprise */}
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-white/90">Par Thierry Gogo</p>
                <p className="text-xs font-semibold text-orange-300">FREELANCE FullStack</p>
                <p className="text-xs text-white/80">07 58 96 61 56</p>
              </div>

              {/* Titre du modal */}
              <div className="text-center space-y-2 pt-2 border-t border-white/20 w-full">
                <DialogTitle className="text-xl font-bold text-white">
                  {modalTitle}
                </DialogTitle>
                <DialogDescription className="text-sm text-white/80">
                  Ce compte aura accès à toutes les organisations
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Body du formulaire */}
          <div className="modal-whatsapp-body">
            {error && (
              <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600">
                <AlertCircle className="inline w-4 h-4 mr-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Champ Nom */}
              <div className="form-whatsapp-group">
                <Label htmlFor="name" className="form-whatsapp-label">
                  <User className="inline w-4 h-4 mr-2" />
                  Nom complet
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name.value}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={`form-whatsapp-input ${formData.name.error ? 'error' : ''}`}
                  disabled={isSubmitting}
                  required
                  placeholder="Entrez votre nom complet"
                />
                {formData.name.error && (
                  <div className="form-whatsapp-error">
                    <AlertCircle className="inline w-3 h-3 mr-1" />
                    {formData.name.error}
                  </div>
                )}
              </div>

              {/* Champ Email */}
              <div className="form-whatsapp-group">
                <Label htmlFor="email" className="form-whatsapp-label">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Adresse email
                </Label>
                <EmailField
                  id="email"
                  value={formData.email.value}
                  onChange={(value) => handleFieldChange('email', value)}
                  disabled={isSubmitting}
                  required
                  error={formData.email.error}
                />
              </div>

              {/* Champ Téléphone */}
              <div className="form-whatsapp-group">
                <Label htmlFor="phone" className="form-whatsapp-label">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Numéro de téléphone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone.value}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  className={`form-whatsapp-input ${formData.phone.error ? 'error' : ''}`}
                  disabled={isSubmitting}
                  placeholder="07 58 96 61 56"
                />
                {formData.phone.error && (
                  <div className="form-whatsapp-error">
                    <AlertCircle className="inline w-3 h-3 mr-1" />
                    {formData.phone.error}
                  </div>
                )}
                <div className="form-whatsapp-help">
                  Format français accepté (optionnel)
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div className="form-whatsapp-group">
                <Label htmlFor="password" className="form-whatsapp-label">
                  <Key className="inline w-4 h-4 mr-2" />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password.value}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    className={`form-whatsapp-input pr-10 ${formData.password.error ? 'error' : ''}`}
                    disabled={isSubmitting}
                    required
                    placeholder="Minimum 8 caractères"
                  />
                  <button
                    type="button"
                    onClick={onToggleShowPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formData.password.error && (
                  <div className="form-whatsapp-error">
                    <AlertCircle className="inline w-3 h-3 mr-1" />
                    {formData.password.error}
                  </div>
                )}
                <div className="form-whatsapp-help">
                  Le mot de passe doit contenir au moins {PASSWORD_MIN_LENGTH} caractères
                </div>
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                className="w-full btn-whatsapp-primary"
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="loading-whatsapp-spinner"></div>
                    Création en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {submitButtonText}
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuperAdminSetupModal;