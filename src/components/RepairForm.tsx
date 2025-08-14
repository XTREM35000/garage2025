import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Camera, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { needsPhotoEvidence } from '@/utils/photoEvidence';
import PhotoEvidenceModal from './PhotoEvidenceModal';
import { GARAGE_CONFIG } from '@/lib/config';

interface RepairFormData {
  clientId: string;
  vehicleId: string;
  type: string;
  description: string;
  durationHours: number;
  estimatedCost: number;
  priority: 'basse' | 'normale' | 'haute' | 'urgente';
  notes: string;
}

interface RepairFormProps {
  onSubmit: (data: RepairFormData, photoEvidence?: { photos: File[]; signature?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<RepairFormData>;
}

const RepairForm: React.FC<RepairFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<RepairFormData>({
    clientId: '',
    vehicleId: '',
    type: '',
    description: '',
    durationHours: 0,
    estimatedCost: 0,
    priority: 'normale',
    notes: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoEvidence, setPhotoEvidence] = useState<{ photos: File[]; signature?: string } | null>(null);
  const [vehicleValue, setVehicleValue] = useState(0);

  // Simuler des données de clients et véhicules (en production, viendrait de la DB)
  const clients = [
    { id: '1', name: 'Kouassi Jean', phone: '+225 07 58 96 61 56' },
    { id: '2', name: 'Diabaté Fatou', phone: '+225 05 42 18 33 77' },
    { id: '3', name: 'Traoré Ali', phone: '+225 01 23 45 67 89' },
  ];

  const vehicles = [
    { id: '1', model: 'Toyota Corolla', plate: 'AB-123-CD', value: 8000000 },
    { id: '2', model: 'Peugeot 206', plate: 'EF-456-GH', value: 3500000 },
    { id: '3', model: 'Renault Logan', plate: 'IJ-789-KL', value: 4200000 },
  ];

  // Déterminer si les preuves photo sont nécessaires
  const triggerPhotoEvidence = needsPhotoEvidence({
    id: 'temp',
    durationHours: formData.durationHours,
    type: formData.type,
    vehicleValue: vehicleValue,
    client: { isBlacklisted: false } // À récupérer depuis la DB
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Le client est requis';
    }
    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Le véhicule est requis';
    }
    if (!formData.type) {
      newErrors.type = 'Le type de réparation est requis';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }
    if (formData.durationHours <= 0) {
      newErrors.durationHours = 'La durée doit être supérieure à 0';
    }
    if (formData.estimatedCost <= 0) {
      newErrors.estimatedCost = 'Le coût estimé doit être supérieur à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Si les preuves photo sont requises mais pas encore fournies
    if (triggerPhotoEvidence && !photoEvidence) {
      setShowPhotoModal(true);
      return;
    }

    // Soumettre le formulaire avec les preuves photo si disponibles
    onSubmit(formData, photoEvidence || undefined);
  };

  const handlePhotoComplete = (photos: File[], signature?: string) => {
    setPhotoEvidence({ photos, signature });
    setShowPhotoModal(false);

    // Soumettre automatiquement après capture des photos
    onSubmit(formData, { photos, signature });
  };

  const handleVehicleChange = (vehicleId: string) => {
    setFormData(prev => ({ ...prev, vehicleId }));
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setVehicleValue(vehicle?.value || 0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'bg-red-100 text-red-800';
      case 'haute': return 'bg-orange-100 text-orange-800';
      case 'normale': return 'bg-blue-100 text-blue-800';
      case 'basse': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Nouvelle Réparation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations client et véhicule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && (
                  <p className="text-sm text-red-500">{errors.clientId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleId">Véhicule *</Label>
                <Select
                  value={formData.vehicleId}
                  onValueChange={handleVehicleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.model} - {vehicle.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vehicleId && (
                  <p className="text-sm text-red-500">{errors.vehicleId}</p>
                )}
              </div>
            </div>

            {/* Type et description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type de réparation *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GARAGE_CONFIG.services.map(service => (
                      <SelectItem key={service} value={service.toLowerCase()}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description détaillée *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez les problèmes identifiés et les travaux à effectuer..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Durée et coût */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="durationHours">Durée estimée (heures) *</Label>
                <Input
                  id="durationHours"
                  type="number"
                  min="1"
                  value={formData.durationHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationHours: parseInt(e.target.value) || 0 }))}
                  placeholder="Ex: 8"
                />
                {errors.durationHours && (
                  <p className="text-sm text-red-500">{errors.durationHours}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Coût estimé (FCFA) *</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  min="0"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: parseInt(e.target.value) || 0 }))}
                  placeholder="Ex: 50000"
                />
                {errors.estimatedCost && (
                  <p className="text-sm text-red-500">{errors.estimatedCost}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes additionnelles</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Informations complémentaires..."
                rows={2}
              />
            </div>

            {/* Alerte preuves photo */}
            {triggerPhotoEvidence && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>📸 Documentation Requise</strong>
                      <p className="text-sm mt-1">
                        Cette réparation nécessite des preuves photo (durée supérieure à 24h, type sensible, véhicule supérieur à 5M FCFA).
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {photoEvidence ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Photos capturées
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => setShowPhotoModal(true)}
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Capturer
                        </Button>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Créer la réparation
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal de preuves photo */}
      <PhotoEvidenceModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onComplete={handlePhotoComplete}
        repairId="temp"
        repairType={formData.type}
        vehicleValue={vehicleValue}
      />
    </div>
  );
};

export default RepairForm;
