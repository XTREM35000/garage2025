import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, MapPin, Clock, Phone } from 'lucide-react';

interface GarageSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  organizationName?: string;
}

const GarageSetupModal: React.FC<GarageSetupModalProps> = ({
  isOpen,
  onComplete,
  organizationName = 'Mon Garage'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    openingHours: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase.rpc('setup_garage', {
        garage_name: formData.name,
        garage_address: formData.address,
        garage_phone: formData.phone,
        garage_opening_hours: formData.openingHours,
        garage_description: formData.description
      });

      if (error) throw error;

      toast.success('Configuration du garage terminée !');
      onComplete();

    } catch (error: any) {
      console.error('❌ Erreur configuration garage:', error);
      toast.error(error.message || 'Erreur lors de la configuration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh] bg-white dark:bg-gray-950">
        <div className="space-y-6">
          {/* En-tête */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Configuration du garage</h2>
            <p className="text-muted-foreground">
              Renseignez les informations de votre établissement
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom du garage */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Building className="w-4 h-4" />
                Nom du garage *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Auto Services Plus"
                className="bg-muted"
                required
                disabled={isLoading}
              />
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-medium flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Adresse *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 rue de la Réparation"
                className="bg-muted"
                required
                disabled={isLoading}
              />
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+33 1 23 45 67 89"
                className="bg-muted"
                disabled={isLoading}
              />
            </div>

            {/* Horaires */}
            <div className="space-y-2">
              <Label
                htmlFor="openingHours"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Horaires d'ouverture
              </Label>
              <textarea
                id="openingHours"
                value={formData.openingHours}
                onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                placeholder="Lun-Ven: 9h-18h&#10;Sam: 9h-12h"
                className="w-full min-h-[80px] rounded-md border bg-muted p-3 text-sm"
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Description
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez votre garage et vos services..."
                className="w-full min-h-[100px] rounded-md border bg-muted p-3 text-sm"
                disabled={isLoading}
              />
            </div>

            {/* Bouton de soumission */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Configuration...' : 'Terminer la configuration'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GarageSetupModal;