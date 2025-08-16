import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AnimatedLogo } from './AnimatedLogo';
import '../styles/whatsapp-theme.css';

export interface OrganizationSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  selectedPlan?: string;
}

const OrganizationSetupModal: React.FC<OrganizationSetupModalProps> = ({
  isOpen,
  onComplete,
  selectedPlan = 'starter'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Générer automatiquement le slug basé sur le nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ýÿ]/g, 'y')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-générer le slug si on modifie le nom
      if (field === 'name') {
        newData.slug = generateSlug(value);
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Générer un code unique pour l'organisation
      const orgCode = `ORG-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      // Créer l'organisation
      const { data: orgData, error: orgError } = await supabase.rpc('create_organisation_with_owner_v2', {
        p_name: formData.name.trim(),
        p_code: orgCode,
        p_slug: formData.slug || generateSlug(formData.name),
        p_email: formData.email || user.email || '',
        p_owner_id: user.id,
        p_subscription_type: selectedPlan
      });

      if (orgError) throw orgError;

      // Mettre à jour le workflow
      const { error: workflowError } = await supabase
        .from('onboarding_workflow_states')
        .upsert({
          user_id: user.id,
          organisation_id: orgData,
          current_step: 'sms-validation',
          updated_at: new Date().toISOString()
        });

      if (workflowError) {
        console.warn('⚠️ Workflow non mis à jour:', workflowError);
      }

      setShowSuccessMessage(true);
      toast.success('Organisation créée avec succès!');
      
      setTimeout(() => {
        onComplete();
      }, 1500);

    } catch (error: any) {
      console.error('❌ Erreur création organisation:', error);
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Réinitialiser le formulaire
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        slug: '',
        email: '',
        description: ''
      });
      setShowSuccessMessage(false);
    }
  }, [isOpen]);

  if (showSuccessMessage) {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Organisation créée !
            </h3>
            <p className="text-sm text-gray-500">
              Redirection en cours...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-lg max-h-[95vh] min-h-[80vh] overflow-y-auto p-0">
        <div className="modal-whatsapp-card h-full flex flex-col">
          {/* Header avec AnimatedLogo */}
          <div className="modal-whatsapp-header">
            <div className="flex flex-col items-center gap-4">
              {/* Logo avec dégradé orange */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 
                           rounded-full opacity-90 blur-xl animate-pulse" />
                <div className="relative bg-black/30 p-4 rounded-full backdrop-blur-sm">
                  <AnimatedLogo
                    mainIcon={Building}
                    secondaryIcon={Mail}
                    mainColor="text-white"
                    secondaryColor="text-yellow-200"
                  />
                </div>
              </div>

              {/* Informations entreprise */}
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-white/90">Par Thierry Gogo</p>
                <p className="text-xs font-semibold text-orange-300">FREELANCE FullStack</p>
                <p className="text-xs text-white/80">07 58 96 61 56</p>
              </div>

              {/* Titre du modal */}
              <div className="text-center space-y-2 pt-2 border-t border-white/20 w-full">
                <DialogTitle className="text-xl font-bold text-white">
                  Création de l'Organisation
                </DialogTitle>
                <DialogDescription className="text-sm text-white/80">
                  Configuration de votre espace de travail
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Body du formulaire */}
          <div className="modal-whatsapp-body flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6 pb-6">
              {/* Champ Nom de l'organisation */}
              <div className="form-whatsapp-group">
                <Label htmlFor="name" className="form-whatsapp-label">
                  <Building className="inline w-4 h-4 mr-2" />
                  Nom de l'organisation *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="form-whatsapp-input"
                  disabled={isSubmitting}
                  required
                  placeholder="Mon Garage Auto"
                />
              </div>

              {/* Champ Slug (généré automatiquement) */}
              <div className="form-whatsapp-group">
                <Label htmlFor="slug" className="form-whatsapp-label">
                  Identifiant unique (URL)
                </Label>
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleFieldChange('slug', e.target.value)}
                  className="form-whatsapp-input font-mono text-sm"
                  disabled={isSubmitting}
                  placeholder="mon-garage-auto"
                />
                <div className="form-whatsapp-help">
                  Généré automatiquement à partir du nom
                </div>
              </div>

              {/* Champ Email */}
              <div className="form-whatsapp-group">
                <Label htmlFor="email" className="form-whatsapp-label">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email de contact
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="form-whatsapp-input"
                  disabled={isSubmitting}
                  placeholder="contact@mongarage.com"
                />
                <div className="form-whatsapp-help">
                  Email principal pour les communications
                </div>
              </div>

              {/* Champ Description */}
              <div className="form-whatsapp-group">
                <Label htmlFor="description" className="form-whatsapp-label">
                  Description (optionnel)
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="form-whatsapp-input min-h-[80px] resize-none"
                  disabled={isSubmitting}
                  placeholder="Brève description de votre activité..."
                  rows={3}
                />
              </div>

              {/* Plan sélectionné */}
              {selectedPlan && (
                <div className="form-whatsapp-group">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Plan sélectionné: {selectedPlan}
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton de soumission */}
              <Button
                type="submit"
                className="w-full btn-whatsapp-primary"
                disabled={!formData.name.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="loading-whatsapp-spinner"></div>
                    Création en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Créer l'Organisation
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationSetupModal;