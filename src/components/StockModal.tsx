import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Package, Save, X, Plus, Edit } from 'lucide-react';

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

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<StockItem, 'id' | 'dateAjout' | 'dateModification'>) => void;
  onUpdate: (item: StockItem) => void;
  item?: StockItem | null;
  mode: 'add' | 'edit';
}

const StockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  item,
  mode
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    quantite: 0,
    prixUnitaire: 0,
    seuilAlerte: 0,
    categorie: '',
    fournisseur: '',
    description: '',
    codeProduit: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const categories = [
    'Filtres',
    'Freinage',
    'Électricité',
    'Lubrifiants',
    'Moteur',
    'Refroidissement',
    'Suspension',
    'Transmission',
    'Carrosserie',
    'Éclairage',
    'Climatisation',
    'Autres'
  ];

  const fournisseurs = [
    'Total Côte d\'Ivoire',
    'Brembo Distribution',
    'Exide Technologies',
    'NGK Spark Plugs',
    'Mann Filter',
    'Gates Corporation',
    'Bosch',
    'Continental',
    'Michelin',
    'Castrol',
    'Mobil',
    'Autres'
  ];

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        nom: item.nom,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire,
        seuilAlerte: item.seuilAlerte,
        categorie: item.categorie,
        fournisseur: item.fournisseur,
        description: item.description || '',
        codeProduit: item.codeProduit || ''
      });
    } else {
      setFormData({
        nom: '',
        quantite: 0,
        prixUnitaire: 0,
        seuilAlerte: 0,
        categorie: '',
        fournisseur: '',
        description: '',
        codeProduit: ''
      });
    }
    setErrors({});
  }, [item, mode, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (formData.quantite < 0) {
      newErrors.quantite = 'La quantité doit être positive';
    }

    if (formData.prixUnitaire < 0) {
      newErrors.prixUnitaire = 'Le prix doit être positif';
    }

    if (formData.seuilAlerte < 0) {
      newErrors.seuilAlerte = 'Le seuil d\'alerte doit être positif';
    }

    if (!formData.categorie) {
      newErrors.categorie = 'La catégorie est requise';
    }

    if (!formData.fournisseur) {
      newErrors.fournisseur = 'Le fournisseur est requis';
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
      [name]: name === 'quantite' || name === 'prixUnitaire' || name === 'seuilAlerte'
        ? parseInt(value) || 0
        : value
    }));

    // Effacer l'erreur du champ modifié
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {mode === 'add' ? (
              <>
                <Plus className="w-5 h-5 text-green-600" />
                <span>Ajouter un élément de stock</span>
              </>
            ) : (
              <>
                <Edit className="w-5 h-5 text-blue-600" />
                <span>Modifier l'élément de stock</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom de l'article *</Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder="Ex: Filtre à huile"
                className={errors.nom ? 'border-red-500' : ''}
              />
              {errors.nom && <p className="text-sm text-red-500">{errors.nom}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="codeProduit">Code produit</Label>
              <Input
                id="codeProduit"
                name="codeProduit"
                value={formData.codeProduit}
                onChange={handleInputChange}
                placeholder="Ex: FIL-001"
              />
            </div>
          </div>

          {/* Quantités et prix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantite">Quantité en stock *</Label>
              <Input
                id="quantite"
                name="quantite"
                type="number"
                min="0"
                value={formData.quantite}
                onChange={handleInputChange}
                className={errors.quantite ? 'border-red-500' : ''}
              />
              {errors.quantite && <p className="text-sm text-red-500">{errors.quantite}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prixUnitaire">Prix unitaire (FCFA) *</Label>
              <Input
                id="prixUnitaire"
                name="prixUnitaire"
                type="number"
                min="0"
                value={formData.prixUnitaire}
                onChange={handleInputChange}
                className={errors.prixUnitaire ? 'border-red-500' : ''}
              />
              {errors.prixUnitaire && <p className="text-sm text-red-500">{errors.prixUnitaire}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seuilAlerte">Seuil d'alerte *</Label>
              <Input
                id="seuilAlerte"
                name="seuilAlerte"
                type="number"
                min="0"
                value={formData.seuilAlerte}
                onChange={handleInputChange}
                className={errors.seuilAlerte ? 'border-red-500' : ''}
              />
              {errors.seuilAlerte && <p className="text-sm text-red-500">{errors.seuilAlerte}</p>}
            </div>
          </div>

          {/* Catégorie et fournisseur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select value={formData.categorie} onValueChange={(value) => handleSelectChange('categorie', value)}>
                <SelectTrigger className={errors.categorie ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categorie && <p className="text-sm text-red-500">{errors.categorie}</p>}
            </div>

            <div className="space-y-2">
              <Label>Fournisseur *</Label>
              <Select value={formData.fournisseur} onValueChange={(value) => handleSelectChange('fournisseur', value)}>
                <SelectTrigger className={errors.fournisseur ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionnez un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {fournisseurs.map(fournisseur => (
                    <SelectItem key={fournisseur} value={fournisseur}>{fournisseur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fournisseur && <p className="text-sm text-red-500">{errors.fournisseur}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description détaillée de l'article..."
              rows={3}
            />
          </div>

          {/* Résumé */}
          {formData.quantite > 0 && formData.prixUnitaire > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Résumé</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Valeur totale:</span>
                  <span className="font-semibold ml-2">
                    {(formData.quantite * formData.prixUnitaire).toLocaleString()} FCFA
                  </span>
                </div>
                <div>
                  <span className="text-green-600">Statut:</span>
                  <span className={`font-semibold ml-2 ${
                    formData.quantite <= formData.seuilAlerte ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {formData.quantite <= formData.seuilAlerte ? 'Stock faible' : 'Stock OK'}
                  </span>
                </div>
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
                <span>{mode === 'add' ? 'Ajouter' : 'Modifier'}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockModal;
