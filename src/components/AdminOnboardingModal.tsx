import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Send
} from 'lucide-react';
import { useBrandCheck } from '@/hooks/useBrandCheck';

interface AdminOnboardingModalProps {
  isOpen: boolean;
  onComplete: (adminData: any) => void;
}

const AdminOnboardingModal: React.FC<AdminOnboardingModalProps> = ({
  isOpen,
  onComplete
}) => {
  const { saveAdminUser } = useBrandCheck();
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    name: '',
    slug: '', // Ajout du slug
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Génération automatique du slug à chaque changement du nom
  useEffect(() => {
    if (formData.name) {
      const prefix = formData.name.replace(/\s/g, '').substring(0, 3).toLowerCase();
      const random = Math.floor(100 + Math.random() * 900); // 3 chiffres aléatoires
      setFormData((prev) => ({
        ...prev,
        slug: `${prefix}${random}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, slug: '' }));
    }
  }, [formData.name]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation email
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    // Validation confirmation mot de passe
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Validation téléphone (format CI)
    if (!formData.phone) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!/^\+225\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Format: +225 XX XX XX XX XX';
    }

    // Validation nom
    if (!formData.name) {
      newErrors.name = 'Le nom complet est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Simuler l'envoi du code SMS
    setTimeout(() => {
      setStep('verification');
      setIsLoading(false);
    }, 2000);
  };

  const handleVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ verification: 'Code de vérification invalide' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await saveAdminUser({
        email: formData.email,
        phone: formData.phone,
        isVerified: true
      });

      if (result.success) {
        onComplete(result.admin);
      }
    } catch (error) {
      setErrors({ verification: 'Erreur lors de la création du compte' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Formatage automatique du numéro de téléphone CI
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('225')) {
      const formatted = cleaned.replace(/(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5');
      return formatted;
    }
    return value;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            Création du compte Administrateur
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Carte d'identité professionnelle */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Identité Professionnelle
                </CardTitle>
                <Badge variant="secondary" className="w-fit">
                  <Shield className="w-3 h-3 mr-1" />
                  Administrateur Principal
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nom complet */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Votre nom complet"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Email professionnel */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@garage.com"
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Téléphone CI */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone CI *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                      placeholder="+225 XX XX XX XX XX"
                      className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe sécurisé *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 8 caractères"
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* Confirmation mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Répétez votre mot de passe"
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Identifiant unique (slug) */}
                <div className="space-y-2">
                 <Label>Identifiant unique (slug) *</Label>
  <div className="bg-gray-100 rounded px-3 py-2 text-gray-700 font-mono select-all border border-gray-200">
    {formData.slug || <span className="text-gray-400">auto-généré</span>}
  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Un code de vérification sera envoyé par SMS au numéro fourni pour sécuriser votre compte.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Send className="w-4 h-4 mr-2 animate-pulse" />
                  Envoi du code SMS...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Créer le compte administrateur
                </>
              )}
            </Button>

            {/* Espace supplémentaire pour s'assurer que le bouton est visible */}
            <div className="h-4"></div>
          </form>
        ) : (
          <div className="space-y-6">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Vérification SMS
                </CardTitle>
                <Badge variant="secondary" className="w-fit">
                  <Phone className="w-3 h-3 mr-1" />
                  Code envoyé à {formData.phone}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Code de vérification *</Label>
                  <Input
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="XXXXXX"
                    className="text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                  />
                  {errors.verification && (
                    <p className="text-sm text-red-500">{errors.verification}</p>
                  )}
                </div>

                <p className="text-sm text-gray-600">
                  Entrez le code à 6 chiffres reçu par SMS pour finaliser la création de votre compte.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('form')}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                onClick={handleVerification}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 animate-pulse" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Vérifier et créer
                  </>
                )}
              </Button>
            </div>

            {/* Espace supplémentaire pour s'assurer que les boutons sont visibles */}
            <div className="h-4"></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminOnboardingModal;
