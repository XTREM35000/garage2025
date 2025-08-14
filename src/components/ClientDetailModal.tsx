import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Crown,
  Clock,
  FileText,
  Shield
} from 'lucide-react';
import { Client, CLIENT_STATUTS } from '@/types/clients';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  client,
  onEdit,
  onDelete
}) => {
  if (!client) return null;

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'VIP':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'Actif':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Nouveau':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'Inactif':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'VIP':
        return <Crown className="w-5 h-5 text-purple-500" />;
      case 'Actif':
        return <Shield className="w-5 h-5 text-green-500" />;
      case 'Nouveau':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'Inactif':
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      onDelete(client.id);
      onClose();
    }
  };

  const calculateAge = (dateNaissance?: string) => {
    if (!dateNaissance) return null;
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Détails du client</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête avec statut */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{client.name}</h2>
              <div className="flex items-center space-x-3">
                {getStatusIcon(client.statut)}
                <Badge className={getStatusColor(client.statut)}>
                  {client.statut}
                </Badge>
                {client.statut === 'VIP' && (
                  <Badge className="text-yellow-600 bg-yellow-100">
                    <Crown className="w-3 h-3 mr-1" />
                    Client Premium
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(client)}
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

          {/* Informations personnelles */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Nom complet</span>
                  <p className="text-lg font-semibold">{client.name}</p>
                </div>

                {client.dateNaissance && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-600">Date de naissance</span>
                    <p className="text-lg font-semibold">
                      {formatDate(client.dateNaissance)}
                      {calculateAge(client.dateNaissance) && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({calculateAge(client.dateNaissance)} ans)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {client.numeroPermis && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Numéro de permis</span>
                  <p className="text-lg font-semibold">{client.numeroPermis}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coordonnées */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Coordonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </span>
                  <p className="text-lg font-semibold">{client.phone}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </span>
                  <p className="text-lg font-semibold">{client.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Adresse
                </span>
                <p className="text-lg font-semibold">{client.adresse}</p>
              </div>
            </CardContent>
          </Card>

          {/* Véhicules */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-orange-600" />
                Véhicules ({client.vehicules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.vehicules.length > 0 ? (
                <div className="space-y-2">
                  {client.vehicules.map((vehicule, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded-lg border">
                      <Car className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{vehicule}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Aucun véhicule enregistré</p>
              )}
            </CardContent>
          </Card>

          {/* Historique et finances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Historique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dernière visite:</span>
                  <span className="font-semibold">{formatDate(client.derniereVisite)}</span>
                </div>

                {client.dateCreation && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Client depuis:</span>
                    <span className="font-semibold">{formatDateTime(client.dateCreation)}</span>
                  </div>
                )}

                {client.dateModification && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Dernière modification:</span>
                    <span className="font-semibold">{formatDateTime(client.dateModification)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Finances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total dépensé:</span>
                  <span className="font-semibold text-green-600 text-lg">
                    {client.totalDepense.toLocaleString()} FCFA
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Véhicules:</span>
                  <span className="font-semibold">{client.vehicules.length}</span>
                </div>

                {client.totalDepense > 0 && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Client fidèle</strong> - {client.totalDepense > 100000 ? 'Très bon client' : 'Bon client'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {client.notes && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{client.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions rapides */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={() => onEdit(client)} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailModal;
