import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkflow } from '@/contexts/WorkflowProvider';
import { useWorkflowSync } from '@/hooks/useWorkflowSync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FormField {
  value: string;
  isValid: boolean;
  error?: string;
  touched: boolean;
}

interface FormData {
  email: FormField;
  password: FormField;
  name: FormField;
}

interface EnhancedSuperAdminSetupProps {
  isOpen: boolean;
  onComplete: () => void;
}

const EnhancedSuperAdminSetup: React.FC<EnhancedSuperAdminSetupProps> = ({
  isOpen,
  onComplete
}) => {
  const { completeStep, validateFormField } = useWorkflow();
  const { syncWorkflow } = useWorkflowSync({ silentMode: true });
  
  const [formData, setFormData] = useState<FormData>({
    email: { value: '', isValid: false, touched: false },
    password: { value: '', isValid: false, touched: false },
    name: { value: '', isValid: false, touched: false }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  // Validation en temps réel
  const validateField = useCallback((field: keyof FormData, value: string) => {
    const validation = validateFormField(field, value);
    
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        isValid: validation.isValid,
        error: validation.error,
        touched: true
      }
    }));
  }, [validateFormField]);

  // Gestion des changements de champs
  const handleFieldChange = useCallback((field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    validateField(field, value);
  }, [validateField]);

  // Vérification de la validité du formulaire
  const isFormValid = useCallback(() => {
    const { email, password, name } = formData;
    
    return (
      email.isValid && email.value.length >= 2 &&
      password.isValid && password.value.length >= 8 &&
      name.isValid && name.value.trim().length > 0
    );
  }, [formData]);

  // Normalisation de l'email (ajout automatique de @gmail.com si nécessaire)
  const normalizeEmail = (email: string): string => {
    if (!email.includes('@') && email.length >= 2) {
      return `${email}@gmail.com`;
    }
    return email;
  };

  // Soumission du formulaire
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('🚀 [SuperAdminSetup] Création super admin...');
      
      const normalizedEmail = normalizeEmail(formData.email.value);
      
      // Étape 1: Vérifier l'unicité
      const { data: existingAdmin } = await supabase
        .from('super_admins')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existingAdmin) {
        throw new Error('Un super administrateur existe déjà');
      }

      // Étape 2: Créer l'utilisateur Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: formData.password.value,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: formData.name.value,
            role: 'super_admin'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Utilisateur non créé');

      console.log('✅ [SuperAdminSetup] Utilisateur Auth créé:', authData.user.id);

      // Étape 3: Créer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: normalizedEmail,
          name: formData.name.value,
          full_name: formData.name.value,
          role: 'super_admin',
          is_superadmin: true
        });

      if (profileError) throw profileError;

      // Étape 4: Créer l'entrée super_admin
      const { error: superAdminError } = await supabase
        .from('super_admins')
        .insert({
          id: authData.user.id,
          user_id: authData.user.id,
          email: normalizedEmail,
          name: formData.name.value,
          est_actif: true
        });

      if (superAdminError) throw superAdminError;

      // Étape 5: Connexion automatique
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: formData.password.value
      });

      if (signInError) throw signInError;

      console.log('✅ [SuperAdminSetup] Super admin créé et connecté');
      
      // Étape 6: Synchroniser le workflow
      await syncWorkflow();
      
      // Étape 7: Compléter l'étape workflow
      await completeStep('super_admin_check');
      
      setShowSuccess(true);
      toast.success('Super administrateur créé avec succès!', {
        description: `Email: ${normalizedEmail}`
      });

      // Redirection après délai
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (err: any) {
      console.error('❌ [SuperAdminSetup] Erreur:', err);
      setError(err.message || 'Erreur lors de la création');
      toast.error('Erreur de création', {
        description: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isFormValid, normalizeEmail, completeStep, syncWorkflow, onComplete]);

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Super Administrateur Créé!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Redirection vers l'étape suivante...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Configuration Super Administrateur</CardTitle>
          <CardDescription>
            Créez le premier super administrateur du système
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                placeholder="Nom du super administrateur"
                value={formData.name.value}
                onChange={handleFieldChange('name')}
                className={formData.name.touched && !formData.name.isValid ? 'border-destructive' : ''}
              />
              {formData.name.touched && formData.name.error && (
                <p className="text-sm text-destructive">{formData.name.error}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Email ou identifiant (min 2 caractères)"
                value={formData.email.value}
                onChange={handleFieldChange('email')}
                className={formData.email.touched && !formData.email.isValid ? 'border-destructive' : ''}
              />
              {formData.email.touched && formData.email.error && (
                <p className="text-sm text-destructive">{formData.email.error}</p>
              )}
              {formData.email.value && !formData.email.value.includes('@') && (
                <p className="text-xs text-muted-foreground">
                  Email final: {normalizeEmail(formData.email.value)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 caractères"
                value={formData.password.value}
                onChange={handleFieldChange('password')}
                className={formData.password.touched && !formData.password.isValid ? 'border-destructive' : ''}
              />
              {formData.password.touched && formData.password.error && (
                <p className="text-sm text-destructive">{formData.password.error}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer le Super Administrateur'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSuperAdminSetup;