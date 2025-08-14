import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Car,
  Calendar,
  User,
  FileText,
  Edit,
  Trash2,
  Gauge,
  Palette,
  Fuel,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Vehicle, VEHICLE_CARBURANTS, VEHICLE_ETATS } from '@/types/vehicles';

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onEdit,
  onDelete
}) => {
  if (!vehicle) return null;

  const getCarburantColor = (carburant: string) => {
    const carburantType = VEHICLE_CARBURANTS.find(c => c.value === carburant);
    return carburantType ? carburantType.color : 'text-gray-600 bg-gray-100';
  };

  const getEtatColor = (etat: string) => {
    const etatType = VEHICLE_ETATS.find(e => e.value === etat);
    return etatType ? etatType.color : 'text-gray-600 bg-gray-100';
  };

  const getEtatIcon = (etat: string) => {
    switch (etat) {
      case 'Excellent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Très bon':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'Bon':
        return <CheckCircle className="w-5 h-5 text-yellow-500" />;
      case 'Moyen':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'Mauvais':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Hors service':
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
      default:
        return <Car className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      onDelete(vehicle.id);
      onClose();
    }
  };

  const calculateAge = (annee: string) => {
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(annee);
  };

  const formatKilometrage = (kilometrage: string) => {
    const km = parseInt(kilometrage);
    if (km >= 1000000) {
      return `${(km / 1000000).toFixed(1)}M km`;
    } else if (km >= 1000) {
      return `${(km / 1000).toFixed(0)}k km`;
    }
    return `${km} km`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-green-600" />
            <span>Détails du véhicule</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête avec informations principales */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {vehicle.marque} {vehicle.modele}
              </h2>
              <p className="text-lg text-gray-600 mb-3">{vehicle.immatriculation}</p>
              <div className="flex items-center space-x-3">
                {getEtatIcon(vehicle.etat)}
                <Badge className={getEtatColor(vehicle.etat)}>
                  {vehicle.etat}
                </Badge>
                <Badge className={getCarburantColor(vehicle.carburant)}>
                  {vehicle.carburant}
                </Badge>
                <Badge className="text-blue-600 bg-blue-100">
                  {vehicle.annee} ({calculateAge(vehicle.annee)} ans)
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(vehicle)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>

          {/* Informations générales */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-green-600" />
                Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Marque</span>
                  <p className="text-lg font-semibold">{vehicle.marque}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Modèle</span>
                  <p className="text-lg font-semibold">{vehicle.modele}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Immatriculation</span>
                  <p className="text-lg font-semibold">{vehicle.immatriculation}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Année</span>
                  <p className="text-lg font-semibold">{vehicle.annee}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Couleur
                  </span>
                  <p className="text-lg font-semibold">{vehicle.couleur}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Fuel className="w-4 h-4" />
                    Carburant
                  </span>
                  <Badge className={getCarburantColor(vehicle.carburant)}>
                    {vehicle.carburant}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Propriétaire et kilométrage */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Propriétaire et Kilométrage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Propriétaire</span>
                  <p className="text-lg font-semibold">{vehicle.proprietaire}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Kilométrage
                  </span>
                  <p className="text-lg font-semibold">{formatKilometrage(vehicle.kilometrage)}</p>
                </div>
              </div>

              {vehicle.numeroChassis && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Numéro de châssis</span>
                  <p className="text-lg font-semibold font-mono">{vehicle.numeroChassis}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates et historique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Dates Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date d'acquisition:</span>
                  <span className="font-semibold">{formatDate(vehicle.dateAcquisition)}</span>
                </div>

                {vehicle.derniereRevision && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Dernière révision:</span>
                    <span className="font-semibold">{formatDate(vehicle.derniereRevision)}</span>
                  </div>
                )}

                {vehicle.prochaineRevision && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Prochaine révision:</span>
                    <span className="font-semibold">{formatDate(vehicle.prochaineRevision)}</span>
                  </div>
                )}

                {vehicle.dateCreation && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Enregistré le:</span>
                    <span className="font-semibold">{formatDateTime(vehicle.dateCreation)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Documents et Contrôles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vehicle.assurance && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Assurance:</span>
                    <span className="font-semibold">{formatDate(vehicle.assurance)}</span>
                  </div>
                )}

                {vehicle.vignette && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Vignette:</span>
                    <span className="font-semibold">{formatDate(vehicle.vignette)}</span>
                  </div>
                )}

                {vehicle.controleTechnique && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Contrôle technique:</span>
                    <span className="font-semibold">{formatDate(vehicle.controleTechnique)}</span>
                  </div>
                )}

                {vehicle.dateModification && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Modifié le:</span>
                    <span className="font-semibold">{formatDateTime(vehicle.dateModification)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* État et notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-yellow-600" />
                  État du Véhicule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  {getEtatIcon(vehicle.etat)}
                  <Badge className={getEtatColor(vehicle.etat)}>
                    {vehicle.etat}
                  </Badge>
                </div>

                {vehicle.etat === 'Mauvais' || vehicle.etat === 'Hors service' ? (
                  <div className="p-3 bg-red-100 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                      <strong>Attention :</strong> Ce véhicule nécessite une attention particulière
                    </p>
                  </div>
                ) : vehicle.etat === 'Moyen' ? (
                  <div className="p-3 bg-orange-100 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800">
                      <strong>Info :</strong> Ce véhicule pourrait nécessiter des réparations
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-green-100 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Excellent :</strong> Ce véhicule est en bon état
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {vehicle.notes && (
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{vehicle.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions rapides */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={() => onEdit(vehicle)} className="bg-green-600 hover:bg-green-700">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailModal;
