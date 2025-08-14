import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Wrench, Save, X, Plus, Edit, Calendar, DollarSign, User, Car, Clock, AlertTriangle } from 'lucide-react';
import { Reparation, ReparationFormData, REPARATION_STATUTS, REPARATION_PRIORITES, VEHICULES_EXEMPLES, CLIENTS_EXEMPLES, TECHNICIENS_EXEMPLES } from '@/types/reparations';

interface ReparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<Reparation, 'id' | 'dateCreation' | 'dateModification'>) => void;
  onUpdate: (item: Reparation) => void;
  item?: Reparation | null;
  mode: 'add' | 'edit';
}

const ReparationModal: React.FC<ReparationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  item,
  mode
}) => {
  const [formData, setFormData] = useState<ReparationFormData>({
    vehicule: '',
    client: '',
    statut: 'En attente',
    description: '',
    prix: 0,
    dateDebut: '',
    dateFin: '',
    technicien: '',
    priorite: 'Normale',
    notes: '',
    piecesUtilisees: [],
    tempsEstime: 0,
    tempsReel: 0
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [newPiece, setNewPiece] = useState('');

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        vehicule: item.vehicule,
        client: item.client,
        statut: item.statut,
        description: item.description,
        prix: item.prix,
        dateDebut: item.dateDebut,
        dateFin: item.dateFin || '',
        technicien: item.technicien || '',
        priorite: item.priorite || 'Normale',
        notes: item.notes || '',
        piecesUtilisees: item.piecesUtilisees || [],
        tempsEstime: item.tempsEstime || 0,
        tempsReel: item.tempsReel || 0
      });
    } else {
      setFormData({
        vehicule: '',
        client: '',
        statut: 'En attente',
        description: '',
        prix: 0,
        dateDebut: new Date().toISOString().split('T')[0],
        dateFin: '',
        technicien: '',
        priorite: 'Normale',
        notes: '',
        piecesUtilisees: [],
        tempsEstime: 0,
        tempsReel: 0
      });
    }
    setErrors({});
    setNewPiece('');
  }, [item, mode, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.vehicule.trim()) {
      newErrors.vehicule = 'Le véhicule est requis';
    }

    if (!formData.client.trim()) {
      newErrors.client = 'Le client est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.prix < 0) {
      newErrors.prix = 'Le prix doit être positif';
    }

    if (!formData.dateDebut) {
      newErrors.dateDebut = 'La date de début est requise';
    }

    if (formData.dateFin && new Date(formData.dateFin) < new Date(formData.dateDebut)) {
      newErrors.dateFin = 'La date de fin doit être postérieure à la date de début';
    }

    if (formData.tempsEstime && formData.tempsEstime < 0) {
      newErrors.tempsEstime = 'Le temps estimé doit être positif';
    }

    if (formData.tempsReel && formData.tempsReel < 0) {
      newErrors.tempsReel = 'Le temps réel doit être positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === 'add') {
        await onSave(formData);
      } else if (item) {
        await onUpdate({
          ...item,
          ...formData,
          dateModification: new Date().toISOString()
        });
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'prix' || name === 'tempsEstime' || name === 'tempsReel'
        ? parseInt(value) || 0
        : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addPiece = () => {
    if (newPiece.trim() && !formData.piecesUtilisees?.includes(newPiece.trim())) {
      setFormData(prev => ({
        ...prev,
        piecesUtilisees: [...(prev.piecesUtilisees || []), newPiece.trim()]
      }));
      setNewPiece('');
    }
  };

  const removePiece = (piece: string) => {
    setFormData(prev => ({
      ...prev,
      piecesUtilisees: prev.piecesUtilisees?.filter(p => p !== piece) || []
    }));
  };

  const getStatutColor = (statut: string) => {
    const status = REPARATION_STATUTS.find(s => s.value === statut);
    return status ? status.color : 'text-gray-600 bg-gray-100';
  };

  const getPrioriteColor = (priorite: string) => {
    const priority = REPARATION_PRIORITES.find(p => p.value === priorite);
    return priority ? priority.color : 'text-gray-600 bg-gray-100';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {mode === 'add' ? (
              <>
                <Plus className="w-5 h-5 text-green-600" />
                <span>Nouvelle réparation</span>
              </>
            ) : (
              <>
                <Edit className="w-5 h-5 text-blue-600" />
                <span>Modifier la réparation</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicule">Véhicule *</Label>
              <Select value={formData.vehicule} onValueChange={(value) => handleSelectChange('vehicule', value)}>
                <SelectTrigger className={errors.vehicule ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionnez un véhicule" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICULES_EXEMPLES.map(vehicule => (
                    <SelectItem key={vehicule} value={vehicule}>{vehicule}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicule && <p className="text-sm text-red-500">{errors.vehicule}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={formData.client} onValueChange={(value) => handleSelectChange('client', value)}>
                <SelectTrigger className={errors.client ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionnez un client" />
                </SelectTrigger>
                <SelectContent>
                  {CLIENTS_EXEMPLES.map(client => (
                    <SelectItem key={client} value={client}>{client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client && <p className="text-sm text-red-500">{errors.client}</p>}
            </div>
          </div>

          {/* Statut et priorité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Statut *</Label>
              <Select value={formData.statut} onValueChange={(value) => handleSelectChange('statut', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  {REPARATION_STATUTS.map(statut => (
                    <SelectItem key={statut.value} value={statut.value}>
                      <div className="flex items-center space-x-2">
                        <Badge className={statut.color}>{statut.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={formData.priorite} onValueChange={(value) => handleSelectChange('priorite', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une priorité" />
                </SelectTrigger>
                <SelectContent>
                  {REPARATION_PRIORITES.map(priorite => (
                    <SelectItem key={priorite.value} value={priorite.value}>
                      <div className="flex items-center space-x-2">
                        <Badge className={priorite.color}>{priorite.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description de la réparation *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez les travaux à effectuer..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Prix et technicien */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prix">Prix (FCFA) *</Label>
              <Input
                id="prix"
                name="prix"
                type="number"
                min="0"
                value={formData.prix}
                onChange={handleInputChange}
                className={errors.prix ? 'border-red-500' : ''}
              />
              {errors.prix && <p className="text-sm text-red-500">{errors.prix}</p>}
            </div>

            <div className="space-y-2">
              <Label>Technicien</Label>
              <Select value={formData.technicien} onValueChange={(value) => handleSelectChange('technicien', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un technicien" />
                </SelectTrigger>
                <SelectContent>
                  {TECHNICIENS_EXEMPLES.map(technicien => (
                    <SelectItem key={technicien} value={technicien}>{technicien}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateDebut">Date de début *</Label>
              <Input
                id="dateDebut"
                name="dateDebut"
                type="date"
                value={formData.dateDebut}
                onChange={handleInputChange}
                className={errors.dateDebut ? 'border-red-500' : ''}
              />
              {errors.dateDebut && <p className="text-sm text-red-500">{errors.dateDebut}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFin">Date de fin</Label>
              <Input
                id="dateFin"
                name="dateFin"
                type="date"
                value={formData.dateFin}
                onChange={handleInputChange}
                className={errors.dateFin ? 'border-red-500' : ''}
              />
              {errors.dateFin && <p className="text-sm text-red-500">{errors.dateFin}</p>}
            </div>
          </div>

          {/* Temps estimé et réel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tempsEstime">Temps estimé (heures)</Label>
              <Input
                id="tempsEstime"
                name="tempsEstime"
                type="number"
                min="0"
                value={formData.tempsEstime}
                onChange={handleInputChange}
                className={errors.tempsEstime ? 'border-red-500' : ''}
              />
              {errors.tempsEstime && <p className="text-sm text-red-500">{errors.tempsEstime}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempsReel">Temps réel (heures)</Label>
              <Input
                id="tempsReel"
                name="tempsReel"
                type="number"
                min="0"
                value={formData.tempsReel}
                onChange={handleInputChange}
                className={errors.tempsReel ? 'border-red-500' : ''}
              />
              {errors.tempsReel && <p className="text-sm text-red-500">{errors.tempsReel}</p>}
            </div>
          </div>

          {/* Pièces utilisées */}
          <div className="space-y-2">
            <Label>Pièces utilisées</Label>
            <div className="flex space-x-2">
              <Input
                value={newPiece}
                onChange={(e) => setNewPiece(e.target.value)}
                placeholder="Ajouter une pièce..."
                onKeyPress={(e) => e.key === 'Enter' && addPiece()}
              />
              <Button type="button" onClick={addPiece} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.piecesUtilisees && formData.piecesUtilisees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.piecesUtilisees.map((piece, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{piece}</span>
                    <button
                      type="button"
                      onClick={() => removePiece(piece)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes additionnelles</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Notes, observations, remarques..."
              rows={3}
            />
          </div>

          {/* Résumé */}
          {formData.prix > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Résumé</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Prix total:</span>
                  <span className="font-semibold ml-2">
                    {formData.prix.toLocaleString()} FCFA
                  </span>
                </div>
                <div>
                  <span className="text-green-600">Statut:</span>
                  <Badge className={`ml-2 ${getStatutColor(formData.statut)}`}>
                    {formData.statut}
                  </Badge>
                </div>
                {formData.tempsEstime && (
                  <div>
                    <span className="text-green-600">Temps estimé:</span>
                    <span className="font-semibold ml-2">{formData.tempsEstime}h</span>
                  </div>
                )}
                {formData.priorite && (
                  <div>
                    <span className="text-green-600">Priorité:</span>
                    <Badge className={`ml-2 ${getPrioriteColor(formData.priorite)}`}>
                      {formData.priorite}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Annuler</span>
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{mode === 'add' ? 'Créer' : 'Modifier'}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReparationModal;
