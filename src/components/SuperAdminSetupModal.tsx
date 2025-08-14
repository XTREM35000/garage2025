import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User, Mail, Phone, Shield, AlertCircle, Eye, EyeOff, Crown, Lock, Sparkles
} from 'lucide-react';
import { supabase, signUpWithEmail } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SuperAdminSetupModalProps {
  isOpen: boolean;
  onComplete: (adminData: any) => void;
}

const SuperAdminSetupModal: React.FC<SuperAdminSetupModalProps> = ({ isOpen, onComplete }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    nom: '',
    prenom: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mots de passe différents';
    }

    if (!formData.phone) {
      newErrors.phone = 'Téléphone requis';
    } else if (!/^\+225\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Format: +225 XX XX XX XX XX';
    }

    if (!formData.nom) newErrors.nom = 'Nom requis';
    if (!formData.prenom) newErrors.prenom = 'Prénom requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('225')) {
      const match = cleaned.match(/^225(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `+225 ${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
      }
    }
    return value;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') value = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('🚀 Début création Super-Admin:', formData.email);

      // 1. Créer l'utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.prenom} ${formData.nom}`,
            phone: formData.phone,
            role: 'superadmin'
          }
        }
      });

      if (authError) {
        console.error('❌ Erreur auth signup:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }

      console.log('✅ Utilisateur créé:', authData.user.id);

      // 2. Insérer dans la table super_admins (RLS corrigé)
      let { data: profileData, error: profileError } = await supabase
        .from('super_admins')
        .insert({
          user_id: authData.user.id,
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
          phone: formData.phone,
          est_actif: true
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Erreur insertion super_admins:', profileError);

        // Si l'utilisateur existe déjà, essayer de le connecter
        if (profileError.message.includes('duplicate key') || profileError.message.includes('already exists')) {
          console.log('🔄 Tentative de connexion utilisateur existant...');

          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          });

          if (signInError) {
            throw new Error('Utilisateur existant mais mot de passe incorrect');
          }

          // Vérifier si déjà super-admin
          const { data: existingAdmin } = await supabase
            .from('super_admins')
            .select('*')
            .eq('user_id', signInData.user.id)
            .single();

          if (existingAdmin) {
            throw new Error('Cet utilisateur est déjà Super-Admin');
          }

          // Créer le profil super-admin
          const { data: newProfileData, error: newProfileError } = await supabase
            .from('super_admins')
            .insert({
              user_id: signInData.user.id,
              email: formData.email,
              nom: formData.nom,
              prenom: formData.prenom,
              phone: formData.phone,
              est_actif: true
            })
            .select()
            .single();

          if (newProfileError) {
            throw new Error(`Erreur création profil: ${newProfileError.message}`);
          }

          profileData = newProfileData;
        } else {
          throw new Error(`Erreur insertion: ${profileError.message}`);
        }
      }

      console.log('✅ Profil Super-Admin créé:', profileData);

      // 3. Créer la relation avec une organisation (si elle existe)
      const { data: orgs } = await supabase
        .from('organisations')
        .select('id')
        .limit(1);

      if (orgs && orgs.length > 0) {
        const { error: userOrgError } = await supabase
          .from('user_organizations')
          .insert({
            user_id: authData.user.id,
            organization_id: orgs[0].id,
            role: 'superadmin'
          });

        if (userOrgError) {
          console.warn('⚠️ Erreur création relation user_organizations:', userOrgError);
          // Ne pas échouer pour cette erreur
        }
      }

      // 4. Succès
      toast.success('Super-Admin créé avec succès !');

      onComplete({
        user: authData.user,
        profile: profileData
      });

    } catch (error: any) {
      console.error('❌ Erreur création Super-Admin:', error);

      // Messages d'erreur spécifiques
      let errorMessage = 'Erreur création Super-Admin';

      if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Email non confirmé. Vérifiez votre boîte mail.';
      } else if (error.message?.includes('User already registered') || error.message?.includes('already registered')) {
        errorMessage = 'Un compte existe déjà avec cet email.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Format d\'email invalide.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Mot de passe trop faible ou invalide.';
      } else if (error.message?.includes('mot de passe incorrect')) {
        errorMessage = 'Mot de passe incorrect pour cet utilisateur existant.';
      } else if (error.message?.includes('déjà Super-Admin')) {
        errorMessage = error.message;
      } else if (error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
        errorMessage = 'Un compte existe déjà avec cet email.';
      } else {
        errorMessage = error.message || 'Erreur inconnue lors de la création';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
            Configuration Super-Admin
          </DialogTitle>
          <DialogDescription className="text-green-600 dark:text-green-300 mt-2">
            Créez le compte administrateur principal pour gérer l'application. Ce compte aura accès à toutes les fonctionnalités d'administration.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-green-200 dark:border-green-700 bg-white/50 dark:bg-green-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Shield className="w-5 h-5" />
              Informations Super-Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-green-700 dark:text-green-300">
                    Prénom *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      className={`pl-10 ${errors.prenom ? 'border-red-500' : ''}`}
                      placeholder="Votre prénom"
                    />
                  </div>
                  {errors.prenom && <p className="text-red-500 text-sm">{errors.prenom}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-green-700 dark:text-green-300">
                    Nom *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      className={`pl-10 ${errors.nom ? 'border-red-500' : ''}`}
                      placeholder="Votre nom"
                    />
                  </div>
                  {errors.nom && <p className="text-red-500 text-sm">{errors.nom}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-700 dark:text-green-300">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-green-700 dark:text-green-300">
                  Téléphone *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-700 dark:text-green-300">
                  Mot de passe *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-green-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-green-700 dark:text-green-300">
                  Confirmer mot de passe *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-green-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
              </div>

              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700">
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Accès complet à toutes les organisations
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Création en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Créer le Super-Admin
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SuperAdminSetupModal;

