import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '@/contexts/WorkflowProvider';
import { Mail } from 'react-feather';
import { Label } from '@/components/ui/label';
import { EmailField } from '@/components/ui/email-field';

interface FormState {
  email: { value: string; error: string; isValid: boolean };
  password: { value: string; error: string; isValid: boolean };
  name: { value: string; error: string; isValid: boolean };
}

const initialFormState: FormState = {
  email: { value: '', error: '', isValid: true },
  password: { value: '', error: '', isValid: true },
  name: { value: '', error: '', isValid: true }
};

export function AdminCreationModal({ organizationId }: { organizationId: string }) {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { completeStep } = useWorkflow();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('🚀 Création admin via RPC...');

      // Conversion explicite des valeurs en string
      const { data, error } = await supabase.rpc('create_standard_admin', {
        p_email: String(formData.email.value),
        p_password: String(formData.password.value),
        p_name: String(formData.name.value),
        p_organization_id: String(organizationId)
      });

      if (error) {
        console.error('🔴 Erreur RPC:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('🔴 Échec RPC:', data);
        throw new Error(data?.message || 'Échec de la création');
      }

      console.log('✅ Admin créé:', data);
      toast.success('Administrateur créé avec succès!');
      await completeStep('admin_creation');
      navigate('/organization-setup');

    } catch (error: any) {
      console.error('❌ Erreur création admin:', error);
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        value,
        error: '',
        isValid: true
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <WhatsAppGroupForm
        formData={formData}
        handleFieldChange={handleFieldChange}
        isSubmitting={isSubmitting}
      />
      {/* Autres champs du formulaire */}
    </form>
  );
}

interface WhatsAppGroupFormProps {
  formData: FormState;
  handleFieldChange: (field: keyof FormState, value: string) => void;
  isSubmitting: boolean;
}

export function WhatsAppGroupForm({ formData, handleFieldChange, isSubmitting }: WhatsAppGroupFormProps) {
  return (
    <div className="form-whatsapp-group">
      <Label htmlFor="adminEmail" className="form-whatsapp-label">
        <Mail className="inline w-4 h-4 mr-2" />
        Email de l'administrateur
      </Label>
      <EmailField
        id="adminEmail"
        value={formData.email.value}
        onChange={(value) => handleFieldChange('email', value)}
        disabled={isSubmitting}
        required
        error={formData.email.error}
      />
    </div>
  );
}