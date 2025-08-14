import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/ui/file-upload';
import {
  Building2,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import { useBrandCheck } from '@/hooks/useBrandCheck';
import { FileService } from '@/integrations/supabase/fileService';

interface BrandSetupWizardProps {
  isOpen: boolean;
  onComplete: (brandData: any) => void;
}

const BrandSetupWizard: React.FC<BrandSetupWizardProps> = ({
  isOpen,
  onComplete
}) => {
  const { saveBrandConfig } = useBrandCheck();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    garageName: '',
    logoUrl: '',
    address: '',
    phone: '',
    email: '',
    currency: 'XOF',
    language: 'FR'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 1, title: 'Logo & Identité', description: 'Upload du logo et nom du garage' },
    { id: 2, title: 'Informations Légales', description: 'Adresse et coordonnées' },
    { id: 3, title: 'Paramètres', description: 'Devise et langue' }
  ];

  const progress = (currentStep / steps.length) * 100;

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.garageName.trim()) {
        newErrors.garageName = 'Le nom du garage est requis';
      }
      if (!formData.logoUrl) {
        newErrors.logo = 'Le logo est requis';
      }
    }

    if (step === 2) {
      if (!formData.address.trim()) {
        newErrors.address = 'L\'adresse est requise';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Le téléphone est requis';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Format d\'email invalide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      const result = await saveBrandConfig({
        garageName: formData.garageName,
        logoUrl: formData.logoUrl,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        currency: formData.currency,
        language: formData.language
      });

      if (result.success) {
        onComplete(result.config);
      }
    } catch (error) {
      console.error('Erreur lors de la configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const result = await FileService.uploadGarageLogo(file, 'garage-temp');
      setFormData({ ...formData, logoUrl: result });
      setErrors({ ...errors, logo: '' });
      return { success: true, url: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
      setErrors({ ...errors, logo: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const handleLogoRemove = () => {
    setFormData({ ...formData, logoUrl: '' });
    setErrors({ ...errors, logo: '' });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Identité du Garage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nom du garage */}
                <div className="space-y-2">
                  <Label htmlFor="garageName">Nom du garage *</Label>
                  <Input
                    id="garageName"
                    value={formData.garageName}
                    onChange={(e) => setFormData({ ...formData, garageName: e.target.value })}
                    placeholder="Ex: Garage Abidjan"
                    className={errors.garageName ? 'border-red-500' : ''}
                  />
                  {errors.garageName && (
                    <p className="text-sm text-red-500">{errors.garageName}</p>
                  )}
                </div>

                {/* Upload Logo */}
                <FileUpload
                  label="Logo du garage"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  maxSize={2 * 1024 * 1024} // 2MB
                  onUpload={handleLogoUpload}
                  onRemove={handleLogoRemove}
                  currentUrl={formData.logoUrl}
                  required
                />
                {errors.logo && (
                  <p className="text-sm text-red-500">{errors.logo}</p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Informations Légales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adresse */}
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse complète *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ex: 123 Avenue de la Paix, Cocody, Abidjan"
                    className={errors.address ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+225 0701234567"
                      className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@garage-abidjan.com"
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Paramètres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Devise */}
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <div className="flex gap-2">
                    {['XOF', 'EUR', 'USD'].map((currency) => (
                      <Button
                        key={currency}
                        type="button"
                        variant={formData.currency === currency ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, currency })}
                        className="flex-1"
                      >
                        {currency}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Langue */}
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <div className="flex gap-2">
                    {[
                      { code: 'FR', name: 'Français' },
                      { code: 'EN', name: 'English' }
                    ].map((lang) => (
                      <Button
                        key={lang.code}
                        type="button"
                        variant={formData.language === lang.code ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, language: lang.code })}
                        className="flex-1"
                      >
                        {lang.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Résumé */}
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    Configuration terminée ! Votre garage sera configuré avec ces paramètres.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Configuration du Garage
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${step.id <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                    }`}
                >
                  {step.id < currentStep ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                <span className="mt-1 text-xs">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="py-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </Button>

          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {currentStep === steps.length ? (
              <>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Configuration...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Terminer
                  </>
                )}
              </>
            ) : (
              <>
                Suivant
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrandSetupWizard;
