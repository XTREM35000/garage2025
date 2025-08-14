import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Shield, Eye, EyeOff, Lock, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FileService } from '@/integrations/supabase/fileService';
import { toast } from 'sonner';

interface EnhancedAdminFormProps {
  isOpen: boolean;
  onComplete: (adminData: any) => void;
  organizationData?: any;
}

const EnhancedAdminForm: React.FC<EnhancedAdminFormProps> = ({
  isOpen,
  onComplete,
  organizationData
}) => {
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.phone) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    }

    if (!formData.nom) {
      newErrors.nom = 'Le nom est requis';
    }
    if (!formData.prenom) {
      newErrors.prenom = 'Le prénom est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('L\'image est trop volumineuse (max 2Mo)');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      console.log('🔄 Création administrateur...');
      
      // 1. Création compte auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.prenom} ${formData.nom}`,
            phone: formData.phone,
            role: 'admin'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user?.id) throw new Error('ID utilisateur non généré');

      // 2. Upload avatar si présent
      let avatarUrl = '/avatar01.png';
      if (avatarFile) {
        try {
          avatarUrl = await FileService.uploadUserAvatar(avatarFile, authData.user.id);
          await supabase.auth.updateUser({
            data: { avatar_url: avatarUrl }
          });
        } catch (avatarError) {
          console.warn('⚠️ Erreur upload avatar:', avatarError);
        }
      }

      // 3. Création dans public.users
      const { error: usersError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.phone,
          role: 'admin',
          organisation_id: organizationData?.id,
          avatar_url: avatarUrl,
          est_actif: true
        });

      if (usersError) throw usersError;

      // 4. Création dans public.profiles
      const { error: profilesError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          user_id: authData.user.id,
          email: formData.email,
          nom_complet: `${formData.prenom} ${formData.nom}`,
          phone: formData.phone,
          role: 'admin',
          organisation_id: organizationData?.id,
          avatar_url: avatarUrl,
          est_actif: true
        });

      if (profilesError) throw profilesError;

      toast.success('Administrateur créé avec succès');
      onComplete({ ...authData.user, avatar_url: avatarUrl });

    } catch (error) {
      console.error('❌ Erreur création admin:', error);
      toast.error('Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Créer l'administrateur
          </DialogTitle>
        </DialogHeader>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="w-5 h-5" />
              Informations de l'administrateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-foreground">
                  Avatar
                </Label>
                <div className="flex items-center space-x-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Aperçu avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="border-border bg-background text-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Image au format JPG, PNG (max 2Mo)
                </p>
              </div>

              {/* Nom et Prénom */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-foreground">
                    Prénom *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prenom"
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      className={`pl-10 border-border bg-background text-foreground ${errors.prenom ? 'border-destructive' : ''}`}
                      placeholder="Votre prénom"
                    />
                  </div>
                  {errors.prenom && (
                    <p className="text-destructive text-sm">{errors.prenom}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-foreground">
                    Nom *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nom"
                      type="text"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      className={`pl-10 border-border bg-background text-foreground ${errors.nom ? 'border-destructive' : ''}`}
                      placeholder="Votre nom"
                    />
                  </div>
                  {errors.nom && (
                    <p className="text-destructive text-sm">{errors.nom}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 border-border bg-background text-foreground ${errors.email ? 'border-destructive' : ''}`}
                    placeholder="admin@garage.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email}</p>
                )}
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">
                  Téléphone *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`pl-10 border-border bg-background text-foreground ${errors.phone ? 'border-destructive' : ''}`}
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>
                {errors.phone && (
                  <p className="text-destructive text-sm">{errors.phone}</p>
                )}
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Mot de passe *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 border-border bg-background text-foreground ${errors.password ? 'border-destructive' : ''}`}
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
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password}</p>
                )}
              </div>

              {/* Confirmation mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirmer le mot de passe *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 border-border bg-background text-foreground ${errors.confirmPassword ? 'border-destructive' : ''}`}
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
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Création en cours...' : 'Créer le compte administrateur'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAdminForm;