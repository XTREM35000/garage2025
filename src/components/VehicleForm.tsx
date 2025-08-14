import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, Calendar, User, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface VehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicleData: VehicleData) => void;
}

export interface VehicleData {
  marque: string;
  modele: string;
  immatriculation: string;
  annee: string;
  couleur: string;
  carburant: string;
  kilometrage: string;
  proprietaire: string;
  numeroChassis: string;
  dateAcquisition: string;
  etat: string;
  notes: string;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<VehicleData>({
    marque: '',
    modele: '',
    immatriculation: '',
    annee: '',
    couleur: '',
    carburant: '',
    kilometrage: '',
    proprietaire: '',
    numeroChassis: '',
    dateAcquisition: '',
    etat: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<VehicleData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<VehicleData> = {};

    if (!formData.marque.trim()) {
      newErrors.marque = 'La marque est requise';
    }
    if (!formData.modele.trim()) {
      newErrors.modele = 'Le modèle est requis';
    }
    if (!formData.immatriculation.trim()) {
      newErrors.immatriculation = "L'immatriculation est requise";
    }
    if (!formData.annee.trim()) {
      newErrors.annee = "L'année est requise";
    }
    if (!formData.proprietaire.trim()) {
      newErrors.proprietaire = 'Le propriétaire est requis';
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
      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSubmit(formData);

      // Reset form
      setFormData({
        marque: '',
        modele: '',
        immatriculation: '',
        annee: '',
        couleur: '',
        carburant: '',
        kilometrage: '',
        proprietaire: '',
        numeroChassis: '',
        dateAcquisition: '',
        etat: '',
        notes: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du véhicule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof VehicleData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const carburantOptions = [
    'Essence',
    'Diesel',
    'Hybride',
    'Électrique',
    'GPL',
    'Autre'
  ];

  const etatOptions = [
    'Excellent',
    'Très bon',
    'Bon',
    'Moyen',
    'Mauvais',
    'Hors service'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Car className="w-5 h-5 text-green-600" />
            Ajouter un Véhicule
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations Générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-4 h-4 text-green-600" />
                Informations Générales
              </CardTitle>
              <CardDescription>
                Informations de base du véhicule
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marque">Marque *</Label>
                <Input
                  id="marque"
                  value={formData.marque}
                  onChange={(e) => handleInputChange('marque', e.target.value)}
                  placeholder="Ex: Peugeot, Renault, Toyota..."
                  className={errors.marque ? 'border-red-500' : ''}
                />
                {errors.marque && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.marque}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modele">Modèle *</Label>
                <Input
                  id="modele"
                  value={formData.modele}
                  onChange={(e) => handleInputChange('modele', e.target.value)}
                  placeholder="Ex: 208, Clio, Yaris..."
                  className={errors.modele ? 'border-red-500' : ''}
                />
                {errors.modele && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.modele}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="immatriculation">Immatriculation *</Label>
                <Input
                  id="immatriculation"
                  value={formData.immatriculation}
                  onChange={(e) => handleInputChange('immatriculation', e.target.value.toUpperCase())}
                  placeholder="Ex: AB-123-CD"
                  className={errors.immatriculation ? 'border-red-500' : ''}
                />
                {errors.immatriculation && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.immatriculation}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="annee">Année *</Label>
                <Input
                  id="annee"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.annee}
                  onChange={(e) => handleInputChange('annee', e.target.value)}
                  placeholder="Ex: 2020"
                  className={errors.annee ? 'border-red-500' : ''}
                />
                {errors.annee && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.annee}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="couleur">Couleur</Label>
                <Input
                  id="couleur"
                  value={formData.couleur}
                  onChange={(e) => handleInputChange('couleur', e.target.value)}
                  placeholder="Ex: Blanc, Noir, Gris..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carburant">Type de Carburant</Label>
                <Select value={formData.carburant} onValueChange={(value) => handleInputChange('carburant', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le carburant" />
                  </SelectTrigger>
                  <SelectContent>
                    {carburantOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Informations Techniques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Informations Techniques
              </CardTitle>
              <CardDescription>
                Détails techniques et administratifs
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kilometrage">Kilométrage (km)</Label>
                <Input
                  id="kilometrage"
                  type="number"
                  min="0"
                  value={formData.kilometrage}
                  onChange={(e) => handleInputChange('kilometrage', e.target.value)}
                  placeholder="Ex: 50000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroChassis">Numéro de Châssis</Label>
                <Input
                  id="numeroChassis"
                  value={formData.numeroChassis}
                  onChange={(e) => handleInputChange('numeroChassis', e.target.value.toUpperCase())}
                  placeholder="Ex: VF3XXXXXXXXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateAcquisition">Date d'Acquisition</Label>
                <Input
                  id="dateAcquisition"
                  type="date"
                  value={formData.dateAcquisition}
                  onChange={(e) => handleInputChange('dateAcquisition', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="etat">État Général</Label>
                <Select value={formData.etat} onValueChange={(value) => handleInputChange('etat', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'état" />
                  </SelectTrigger>
                  <SelectContent>
                    {etatOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Propriétaire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                Propriétaire
              </CardTitle>
              <CardDescription>
                Informations sur le propriétaire du véhicule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="proprietaire">Nom du Propriétaire *</Label>
                <Input
                  id="proprietaire"
                  value={formData.proprietaire}
                  onChange={(e) => handleInputChange('proprietaire', e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className={errors.proprietaire ? 'border-red-500' : ''}
                />
                {errors.proprietaire && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.proprietaire}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                Notes et Observations
              </CardTitle>
              <CardDescription>
                Informations supplémentaires et observations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observations particulières, historique des réparations, etc."
                  rows={4}
                />
              </div>
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
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Ajout en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ajouter le Véhicule
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleForm;
