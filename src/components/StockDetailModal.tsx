import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, DollarSign, AlertTriangle, Edit, Trash2 } from 'lucide-react';

interface StockItem {
  id: number;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  seuilAlerte: number;
  categorie: string;
  fournisseur: string;
  description?: string;
  codeProduit?: string;
  dateAjout?: string;
  dateModification?: string;
}

interface StockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StockItem | null;
  onEdit: (item: StockItem) => void;
  onDelete: (id: number) => void;
}

const StockDetailModal: React.FC<StockDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEdit,
  onDelete
}) => {
  if (!item) return null;

  const getStatusColor = () => {
    if (item.quantite === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (item.quantite <= item.seuilAlerte) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = () => {
    if (item.quantite === 0) return 'Rupture de stock';
    if (item.quantite <= item.seuilAlerte) return 'Stock faible';
    return 'Stock disponible';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non renseigné';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      onDelete(item.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Détails de l'élément</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête avec statut */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.nom}</h2>
              {item.codeProduit && (
                <p className="text-sm text-gray-500 mb-3">Code: {item.codeProduit}</p>
              )}
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
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
          {item.description && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{item.description}</p>
            </div>
          )}

          {/* Informations de stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Informations de stock</span>
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantité en stock:</span>
                  <span className={`font-semibold ${item.quantite <= item.seuilAlerte ? 'text-orange-600' : 'text-gray-900'}`}>
                    {item.quantite} unités
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Seuil d'alerte:</span>
                  <span className="font-semibold">{item.seuilAlerte} unités</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prix unitaire:</span>
                  <span className="font-semibold">{item.prixUnitaire.toLocaleString()} FCFA</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valeur totale:</span>
                  <span className="font-semibold text-green-600">
                    {(item.quantite * item.prixUnitaire).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Informations générales</span>
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Catégorie:</span>
                  <span className="font-semibold">{item.categorie}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fournisseur:</span>
                  <span className="font-semibold">{item.fournisseur}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date d'ajout:</span>
                  <span className="font-semibold">{formatDate(item.dateAjout)}</span>
                </div>

                {item.dateModification && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Dernière modification:</span>
                    <span className="font-semibold">{formatDate(item.dateModification)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alerte de stock faible */}
          {item.quantite <= item.seuilAlerte && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-orange-800">Alerte de stock</h4>
              </div>
              <p className="text-orange-700 text-sm">
                Le stock de cet article est faible. Quantité actuelle: {item.quantite} unités
                (seuil d'alerte: {item.seuilAlerte} unités)
              </p>
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

export default StockDetailModal;
