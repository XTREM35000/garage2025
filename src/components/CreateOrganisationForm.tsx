import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { debounce } from '@/lib/utils';

interface FormData {
  nom: string;
  slug: string;
  email: string;
  password: string;
}

interface SlugValidation {
  isChecking: boolean;
  isAvailable: boolean;
  suggestions: string[];
}

interface CreateOrganisationFormProps {
  prefillEmail?: string;
  onSuccess?: () => void;
}

const CreateOrganisationForm: React.FC<CreateOrganisationFormProps> = ({ 
  prefillEmail = '', 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    nom: '',
    slug: '',
    email: '',
    password: ''
  });

  const [slugValidation, setSlugValidation] = useState<SlugValidation>({
    isChecking: false,
    isAvailable: true,
    suggestions: []
  });

  // Fonction pour générer des suggestions de slug
  const generateSlugSuggestions = (baseSlug: string): string[] => {
    const suggestions = [];
    suggestions.push(`${baseSlug}-${Math.floor(Math.random() * 1000)}`);
    suggestions.push(`${baseSlug}-${new Date().getFullYear()}`);
    suggestions.push(`${baseSlug}-pro`);
    return suggestions;
  };

  // Vérification du slug en temps réel
  const checkSlugAvailability = debounce(async (slug: string) => {
    if (!slug) return;

    setSlugValidation(prev => ({ ...prev, isChecking: true }));

    try {
      const { data, error } = await supabase
        .from('organisations')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;

      const isAvailable = !data;
      const suggestions = isAvailable ? [] : generateSlugSuggestions(slug);

      setSlugValidation({
        isChecking: false,
        isAvailable,
        suggestions
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du slug:', error);
      setSlugValidation({
        isChecking: false,
        isAvailable: true,
        suggestions: []
      });
    }
  }, 500);

  // Génération automatique du slug basée sur le nom
  const generateSlug = (name: string): string => {
    if (!name) return '';
    
    // Nettoyer le nom (supprimer caractères spéciaux, garder lettres et chiffres)
    const cleanName = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .trim();
    
    // Prendre les 3 premiers caractères
    const prefix = cleanName.substring(0, 3);
    
    // Générer 3 chiffres aléatoires
    const randomNumbers = Math.floor(Math.random() * 900) + 100; // 100-999
    
    return `${prefix}-${randomNumbers}`;
  };

  // Mettre à jour le slug quand le nom change
  useEffect(() => {
    if (formData.nom && !formData.slug) {
      const newSlug = generateSlug(formData.nom);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.nom]);

  // Pré-remplir l'email si fourni
  useEffect(() => {
    if (prefillEmail && !formData.email) {
      setFormData(prev => ({ ...prev, email: prefillEmail }));
    }
  }, [prefillEmail]);

  useEffect(() => {
    if (formData.slug) {
      checkSlugAvailability(formData.slug);
    }
  }, [formData.slug]);

  useEffect(() => {
    // Vérifier s'il existe déjà des organisations
    const checkExistingOrganisations = async () => {
      try {
        console.log('Vérification des organisations existantes...');
        const { data, error } = await supabase
          .from('organisations')
          .select('id, name')
          .eq('is_active', true)
          .limit(1);

        if (error) {
          console.error('Erreur lors de la vérification:', error);
          throw error;
        }

        console.log('Résultat de la vérification:', data);

        // S'il y a déjà des organisations, rediriger vers /auth
        if (data && data.length > 0) {
          console.log(`Organisation existante trouvée: ${data[0].name}`);
          toast.info('Des organisations existent déjà');
          navigate('/auth');
        } else {
          console.log('Aucune organisation existante trouvée');
        }
      } catch (e) {
        console.error('Erreur lors de la vérification des organisations:', e);
      }
    };

    checkExistingOrganisations();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.nom || !formData.slug || !formData.email || !formData.password) {
        throw new Error('Tous les champs sont requis');
      }

      if (!slugValidation.isAvailable) {
        throw new Error('Cet identifiant est déjà utilisé. Veuillez en choisir un autre.');
      }

      // Créer la première organisation
      const { data, error: invokeError } = await supabase.functions.invoke('create-organisation', {
        body: {
          name: formData.nom,
          slug: formData.slug,
          email_admin: formData.email,
          password: formData.password
        }
      });

      if (invokeError) {
        // Erreur réseau ou de fonction Edge
        const errorBody = await invokeError.context.json();
        const errorMessage = errorBody.error || invokeError.message;

        // Si c'est une erreur de doublon de slug
        if (errorMessage.includes('duplicate key value') && errorMessage.includes('slug')) {
          const suggestions = generateSlugSuggestions(formData.slug);
          setSlugValidation({
            isChecking: false,
            isAvailable: false,
            suggestions
          });
          throw new Error(`L'identifiant "${formData.slug}" est déjà utilisé. Suggestions disponibles : ${suggestions.join(', ')}`);
        }

        throw new Error(errorMessage);
      }

      if (data.error) {
        // Erreur métier retournée par la fonction
        throw new Error(data.error);
      }

      // Définir le contexte organisationnel
      await supabase.functions.invoke('set-organisation-context', {
        body: { organisationId: data.organisation_id }
      });

      // Stocker l'organisation créée
      localStorage.setItem('selectedOrganisationSlug', formData.slug);

      toast.success('Organisation créée avec succès !');
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/auth');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la création';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'slug') {
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, slug: suggestion }));
  };

  const steps = [
    { id: 1, title: 'Informations', description: 'Nom et identifiant' },
    { id: 2, title: 'Administrateur', description: 'Compte principal' },
    { id: 3, title: 'Validation', description: 'Création finale' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header avec logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl shadow-lg mb-6">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenue !</h1>
          <p className="text-gray-600 text-lg">Créons votre organisation</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  currentStep >= step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 transition-all duration-200 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {steps[currentStep - 1].title}
            </CardTitle>
            <p className="text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-6" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Organisation Info */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in slide-in-from-left-2">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom de l'organisation *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      placeholder="Ex: Garage Excellence Abidjan"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Identifiant unique *</Label>
                    <div className="relative">
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="Ex: garage-excellence"
                        className={`transition-all duration-200 focus:ring-2 ${
                          slugValidation.isChecking
                            ? 'pr-10 border-yellow-500 focus:ring-yellow-500'
                            : slugValidation.isAvailable
                              ? 'pr-10 border-green-500 focus:ring-green-500'
                              : 'pr-10 border-red-500 focus:ring-red-500'
                        }`}
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {slugValidation.isChecking ? (
                          <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                        ) : slugValidation.isAvailable ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Identifiant URL-friendly (lettres, chiffres et tirets uniquement)
                    </p>
                    {!slugValidation.isAvailable && slugValidation.suggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-red-600 mb-1">Suggestions disponibles :</p>
                        <div className="flex flex-wrap gap-2">
                          {slugValidation.suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    disabled={!formData.nom || !formData.slug || !slugValidation.isAvailable}
                  >
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Admin Account */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in slide-in-from-left-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email administrateur *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="admin@garage-excellence.com"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Cet email sera utilisé pour le compte administrateur principal
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe administrateur *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Mot de passe sécurisé"
                      minLength={6}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Minimum 6 caractères
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      Retour
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      disabled={!formData.email || !formData.password}
                    >
                      Continuer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Validation */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-left-2">
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-blue-900">Récapitulatif</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Organisation:</span>
                        <span className="font-medium">{formData.nom}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Identifiant:</span>
                        <span className="font-medium">{formData.slug}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email admin:</span>
                        <span className="font-medium">{formData.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Ce qui va être créé :</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Votre organisation avec les paramètres de base</li>
                      <li>• Un compte administrateur principal</li>
                      <li>• L'accès complet au système de gestion</li>
                      <li>• La possibilité d'inviter d'autres utilisateurs</li>
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Créer l'organisation
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateOrganisationForm;
