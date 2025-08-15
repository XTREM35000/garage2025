import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OrganizationSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  selectedPlan: string;
}

const OrganizationSetupModal: React.FC<OrganizationSetupModalProps> = ({
  isOpen,
  onComplete,
  selectedPlan
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Création de l'organisation
      const { data, error } = await supabase.rpc('create_organisation_with_admin_v2', {
        org_name: formData.name,
        org_slug: formData.slug,
        org_subscription_plan: selectedPlan,
        admin_id: user.id
      });

      if (error) throw error;

      toast.success('Organisation créée avec succès!');
      onComplete();

    } catch (error: any) {
      console.error('❌ Erreur création organisation:', error);
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Création de votre organisation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'organisation</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Garage XYZ"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Identifiant unique</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
              placeholder="garage-xyz"
              pattern="^[a-z0-9-]+$"
              title="Lettres minuscules, chiffres et tirets uniquement"
              required
            />
            <p className="text-sm text-gray-500">
              Cet identifiant sera utilisé dans l'URL de votre espace
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Création...' : 'Créer l\'organisation'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationSetupModal;