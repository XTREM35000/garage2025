import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Phone,
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  FileText
} from 'lucide-react';

interface ThirdPartyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ThirdPartyData) => void;
  vehicleInfo?: {
    marque: string;
    modele: string;
    immatriculation: string;
    proprietaire: string;
    proprietairePhone: string;
  };
}

export interface ThirdPartyData {
  thirdPartyName: string;
  thirdPartyPhone: string;
  cniPhoto?: File;
  ownerPhone: string;
  vehicleInfo: {
    marque: string;
    modele: string;
    immatriculation: string;
  };
  restrictions?: string;
  consentSms: boolean;
}

const ThirdPartyForm: React.FC<ThirdPartyFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vehicleInfo
}) => {
  const [formData, setFormData] = useState<ThirdPartyData>({
    thirdPartyName: '',
    thirdPartyPhone: '',
    ownerPhone: vehicleInfo?.proprietairePhone || '',
    vehicleInfo: {
      marque: vehicleInfo?.marque || '',
      modele: vehicleInfo?.modele || '',
      immatriculation: vehicleInfo?.immatriculation || ''
    },
    restrictions: '',
    consentSms: true
  });

  const [errors, setErrors] = useState<Partial<ThirdPartyData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cniPhotoPreview, setCniPhotoPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<ThirdPartyData> = {};

    if (!formData.thirdPartyName.trim()) {
      newErrors.thirdPartyName = 'Le nom complet est requis';
    }
    if (!formData.thirdPartyPhone.trim()) {
      newErrors.thirdPartyPhone = 'Le numéro de téléphone est requis';
    } else if (!/^(\+225|225)?[0-9]{8}$/.test(formData.thirdPartyPhone.replace(/\s/g, ''))) {
      newErrors.thirdPartyPhone = 'Format de téléphone invalide (+225 XX XX XX XX)';
    }
    if (!formData.ownerPhone.trim()) {
      newErrors.ownerPhone = 'Le numéro du propriétaire est requis';
    } else if (!/^(\+225|225)?[0-9]{8}$/.test(formData.ownerPhone.replace(/\s/g, ''))) {
      newErrors.ownerPhone = 'Format de téléphone invalide (+225 XX XX XX XX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulation d'envoi SMS et validation
      await new Promise(resolve => setTimeout(resolve, 2000));

      setShowSuccess(true);

      // Fermer le modal après 3 secondes
      setTimeout(() => {
        onSubmit(formData);
        setShowSuccess(false);
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Erreur lors de la validation tiers:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ThirdPartyData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleVehicleInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleInfo: { ...prev.vehicleInfo, [field]: value }
    }));
  };

  const handleCniPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        alert('La photo ne doit pas dépasser 2MB');
        return;
      }

      setFormData(prev => ({ ...prev, cniPhoto: file }));

      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setCniPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Formatage automatique du numéro de téléphone ivoirien
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('225')) {
      return `+225 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
    } else if (cleaned.startsWith('00225')) {
      return `+225 ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)} ${cleaned.slice(11, 13)}`;
    } else if (cleaned.length === 8) {
      return `+225 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
    }
    return value;
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Demande Envoyée !</h3>
            <p className="text-gray-600 mb-4">
              Un SMS a été envoyé au propriétaire pour validation.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <Clock className="w-4 h-4 inline mr-1" />
                Le code de validation expire dans 24h
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-5 h-5 text-orange-600" />
            Dépôt par Tiers
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avertissement */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Important :</strong> Vous êtes responsable du véhicule jusqu'à sa récupération par le propriétaire.
            </AlertDescription>
          </Alert>

          {/* Informations du Tiers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Vos Informations
              </CardTitle>
              <CardDescription>
                Informations personnelles du tiers déposant le véhicule
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thirdPartyName">Nom Complet *</Label>
                <Input
                  id="thirdPartyName"
                  value={formData.thirdPartyName}
                  onChange={(e) => handleInputChange('thirdPartyName', e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className={errors.thirdPartyName ? 'border-red-500' : ''}
                />
                {errors.thirdPartyName && (
                  <p className="text-sm text-red-500">{errors.thirdPartyName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="thirdPartyPhone">Votre Téléphone *</Label>
                <Input
                  id="thirdPartyPhone"
                  value={formData.thirdPartyPhone}
                  onChange={(e) => handleInputChange('thirdPartyPhone', formatPhoneNumber(e.target.value))}
                  placeholder="+225 XX XX XX XX"
                  className={errors.thirdPartyPhone ? 'border-red-500' : ''}
                />
                {errors.thirdPartyPhone && (
                  <p className="text-sm text-red-500">{errors.thirdPartyPhone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Photo CNI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-600" />
                Pièce d'Identité (Recommandé)
              </CardTitle>
              <CardDescription>
                Photo de votre carte nationale d'identité pour plus de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id="cniPhoto"
                    accept="image/*"
                    onChange={handleCniPhotoChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="cniPhoto"
                    className="cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-blue-600" />
                    Choisir une photo
                  </Label>
                  <span className="text-sm text-gray-500">Max 2MB</span>
                </div>

                {cniPhotoPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Aperçu :</p>
                    <img
                      src={cniPhotoPreview}
                      alt="Aperçu CNI"
                      className="w-32 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations du Véhicule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                Informations du Véhicule
              </CardTitle>
              <CardDescription>
                Vérifiez les informations du véhicule à déposer
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleMarque">Marque</Label>
                <Input
                  id="vehicleMarque"
                  value={formData.vehicleInfo.marque}
                  onChange={(e) => handleVehicleInfoChange('marque', e.target.value)}
                  placeholder="Ex: Peugeot"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleModele">Modèle</Label>
                <Input
                  id="vehicleModele"
                  value={formData.vehicleInfo.modele}
                  onChange={(e) => handleVehicleInfoChange('modele', e.target.value)}
                  placeholder="Ex: 208"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleImmatriculation">Immatriculation</Label>
                <Input
                  id="vehicleImmatriculation"
                  value={formData.vehicleInfo.immatriculation}
                  onChange={(e) => handleVehicleInfoChange('immatriculation', e.target.value.toUpperCase())}
                  placeholder="Ex: AB-123-CD"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Propriétaire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-600" />
                Contact du Propriétaire
              </CardTitle>
              <CardDescription>
                Numéro de téléphone du propriétaire pour validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerPhone">Téléphone Propriétaire *</Label>
                  <Input
                    id="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={(e) => handleInputChange('ownerPhone', formatPhoneNumber(e.target.value))}
                    placeholder="+225 XX XX XX XX"
                    className={errors.ownerPhone ? 'border-red-500' : ''}
                  />
                  {errors.ownerPhone && (
                    <p className="text-sm text-red-500">{errors.ownerPhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restrictions">Restrictions (Optionnel)</Label>
                  <Textarea
                    id="restrictions"
                    value={formData.restrictions}
                    onChange={(e) => handleInputChange('restrictions', e.target.value)}
                    placeholder="Ex: Pas de sortie essai, Réparation moteur uniquement..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consentSms"
                    checked={formData.consentSms}
                    onCheckedChange={(checked) => handleInputChange('consentSms', checked as boolean)}
                    disabled
                  />
                  <Label htmlFor="consentSms" className="text-sm">
                    Le propriétaire sera notifié par SMS pour validation
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations Légales */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Shield className="w-4 h-4" />
                Informations Légales
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-orange-700 space-y-2">
              <p>• Vous êtes responsable du véhicule jusqu'à sa récupération</p>
              <p>• Le propriétaire recevra un SMS avec un code de validation</p>
              <p>• L'autorisation expire automatiquement après 24h</p>
              <p>• Le propriétaire peut annuler l'autorisation à tout moment</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Envoyer la Demande
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ThirdPartyForm;
