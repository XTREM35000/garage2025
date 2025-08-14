import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Calendar, DollarSign, User, Car, Clock, AlertTriangle, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Reparation, REPARATION_STATUTS, REPARATION_PRIORITES } from '@/types/reparations';

interface ReparationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Reparation | null;
  onEdit: (item: Reparation) => void;
  onDelete: (id: number) => void;
}

const ReparationDetailModal: React.FC<ReparationDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEdit,
  onDelete
}) => {
  if (!item) return null;

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'En cours':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Terminé':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'En attente':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'Annulé':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Wrench className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (statut: string) => {
    const status = REPARATION_STATUTS.find(s => s.value === statut);
    return status ? status.color : 'text-gray-600 bg-gray-100';
  };

  const getPrioriteColor = (priorite: string) => {
    const priority = REPARATION_PRIORITES.find(p => p.value === priorite);
    return priority ? priority.color : 'text-gray-600 bg-gray-100';
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réparation ?')) {
      onDelete(item.id);
      onClose();
    }
  };

  const calculateDuration = () => {
    if (!item.dateFin) return null;
    const start = new Date(item.dateDebut);
    const end = new Date(item.dateFin);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            <span>Détails de la réparation</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête avec statut */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.vehicule}</h2>
              <p className="text-lg text-gray-600 mb-3">{item.client}</p>
              <div className="flex items-center space-x-3">
                {getStatusIcon(item.statut)}
                <Badge className={getStatusColor(item.statut)}>
                  {item.statut}
                </Badge>
                {item.priorite && (
                  <Badge className={getPrioriteColor(item.priorite)}>
                    {item.priorite}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(item)}
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

          {/* Description */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Description des travaux</h3>
            <p className="text-gray-700">{item.description}</p>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <Car className="w-4 h-4" />
                <span>Informations véhicule</span>
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Véhicule:</span>
                  <span className="font-semibold">{item.vehicule}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-semibold">{item.client}</span>
                </div>

                {item.technicien && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Technicien:</span>
                    <span className="font-semibold">{item.technicien}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Informations financières</span>
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prix total:</span>
                  <span className="font-semibold text-green-600 text-lg">
                    {item.prix.toLocaleString()} FCFA
                  </span>
                </div>

                {item.tempsEstime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Temps estimé:</span>
                    <span className="font-semibold">{item.tempsEstime}h</span>
                  </div>
                )}

                {item.tempsReel && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Temps réel:</span>
                    <span className="font-semibold">{item.tempsReel}h</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dates et planning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Planning</span>
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date de début:</span>
                  <span className="font-semibold">{formatDate(item.dateDebut)}</span>
                </div>

                {item.dateFin && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Date de fin:</span>
                    <span className="font-semibold">{formatDate(item.dateFin)}</span>
                  </div>
                )}

                {calculateDuration() && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Durée:</span>
                    <span className="font-semibold">{calculateDuration()} jour(s)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Historique</span>
              </h3>

              <div className="space-y-3">
                {item.dateCreation && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Créée le:</span>
                    <span className="font-semibold">{formatDateTime(item.dateCreation)}</span>
                  </div>
                )}

                {item.dateModification && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Modifiée le:</span>
                    <span className="font-semibold">{formatDateTime(item.dateModification)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pièces utilisées */}
          {item.piecesUtilisees && item.piecesUtilisees.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Pièces utilisées</h3>
              <div className="flex flex-wrap gap-2">
                {item.piecesUtilisees.map((piece, index) => (
                  <Badge key={index} variant="secondary">
                    {piece}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Notes</h3>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-700">{item.notes}</p>
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={() => onEdit(item)} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReparationDetailModal;
