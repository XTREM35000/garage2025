import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  Shield,
  CheckCircle,
  AlertCircle,
  Save,
  Plus
} from 'lucide-react';

interface ClientFormData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  dateNaissance: string;
  numeroPermis: string;
  statut: 'nouveau' | 'actif' | 'vip' | 'inactif';
  notes: string;
}

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<ClientFormData>;
}

const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: '',
    dateNaissance: '',
    numeroPermis: '',
    statut: 'nouveau',
    notes: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation nom
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    } else if (formData.prenom.length < 2) {
      newErrors.prenom = 'Le prénom doit contenir au moins 2 caractères';
    }

    // Validation téléphone (format CI)
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le numéro de téléphone est requis';
    } else if (!/^\+225\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = 'Format: +225 XX XX XX XX XX';
    }

    // Validation email (optionnel mais format valide si fourni)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation adresse
    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit(formData);
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

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'vip': return 'text-purple-600 bg-purple-100';
      case 'actif': return 'text-green-600 bg-green-100';
      case 'nouveau': return 'text-blue-600 bg-blue-100';
      case 'inactif': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'vip': return 'VIP';
      case 'actif': return 'Actif';
      case 'nouveau': return 'Nouveau';
      case 'inactif': return 'Inactif';
      default: return 'Nouveau';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            {initialData.nom ? 'Modifier le client' : 'Nouveau client'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informations Personnelles
              </CardTitle>
              <Badge variant="secondary" className="w-fit">
                <Shield className="w-3 h-3 mr-1" />
                Données obligatoires
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom */}
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Nom de famille"
                    className={errors.nom ? 'border-red-500' : ''}
                  />
                  {errors.nom && (
                    <p className="text-sm text-red-500">{errors.nom}</p>
                  )}
                </div>

                {/* Prénom */}
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    placeholder="Prénom"
                    className={errors.prenom ? 'border-red-500' : ''}
                  />
                  {errors.prenom && (
                    <p className="text-sm text-red-500">{errors.prenom}</p>
                  )}
                </div>
              </div>

              {/* Date de naissance */}
              <div className="space-y-2">
                <Label htmlFor="dateNaissance">Date de naissance</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="dateNaissance"
                    type="date"
                    value={formData.dateNaissance}
                    onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Numéro de permis */}
              <div className="space-y-2">
                <Label htmlFor="numeroPermis">Numéro de permis de conduire</Label>
                <Input
                  id="numeroPermis"
                  value={formData.numeroPermis}
                  onChange={(e) => setFormData({ ...formData, numeroPermis: e.target.value })}
                  placeholder="Numéro de permis"
                />
              </div>
            </CardContent>
          </Card>

          {/* Coordonnées */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Coordonnées
              </CardTitle>
              <Badge variant="secondary" className="w-fit">
                <Mail className="w-3 h-3 mr-1" />
                Contact
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="telephone">Numéro de téléphone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: formatPhoneNumber(e.target.value) })}
                    placeholder="+225 XX XX XX XX XX"
                    className={`pl-10 ${errors.telephone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.telephone && (
                  <p className="text-sm text-red-500">{errors.telephone}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@email.com"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="adresse"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    placeholder="Adresse complète (quartier, ville)"
                    className={`pl-10 ${errors.adresse ? 'border-red-500' : ''}`}
                    rows={3}
                  />
                </div>
                {errors.adresse && (
                  <p className="text-sm text-red-500">{errors.adresse}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statut et notes */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-purple-600" />
                Statut et Informations
              </CardTitle>
              <Badge variant="secondary" className="w-fit">
                <CheckCircle className="w-3 h-3 mr-1" />
                Gestion
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Statut */}
              <div className="space-y-2">
                <Label htmlFor="statut">Statut du client</Label>
                <Select
                  value={formData.statut}
                  onValueChange={(value: any) => setFormData({ ...formData, statut: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nouveau">
                      <div className="flex items-center gap-2">
                        <Badge className="text-blue-600 bg-blue-100">Nouveau</Badge>
                        <span>Nouveau client</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="actif">
                      <div className="flex items-center gap-2">
                        <Badge className="text-green-600 bg-green-100">Actif</Badge>
                        <span>Client actif</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="vip">
                      <div className="flex items-center gap-2">
                        <Badge className="text-purple-600 bg-purple-100">VIP</Badge>
                        <span>Client VIP</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="inactif">
                      <div className="flex items-center gap-2">
                        <Badge className="text-gray-600 bg-gray-100">Inactif</Badge>
                        <span>Client inactif</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes et commentaires</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations supplémentaires, préférences, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Aperçu du statut */}
          <div className="flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Statut sélectionné :</p>
              <Badge className={`text-lg px-4 py-2 ${getStatusColor(formData.statut)}`}>
                {getStatusLabel(formData.statut)}
              </Badge>
            </div>
          </div>

          {/* Informations */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Les informations marquées d'un * sont obligatoires. Le client sera automatiquement ajouté à votre base de données.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {initialData.nom ? 'Modifier' : 'Ajouter'} le client
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
