import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, Key, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // Import modifié
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string; // Changé de 'nom' à 'name' pour correspondre à Supabase
  code: string;
  description?: string;
}

interface OrganizationSelectProps {
  onSelect: (orgId: string, orgCode: string) => void;
}

const OrganizationSelect: React.FC<OrganizationSelectProps> = ({ onSelect }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [accessCode, setAccessCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Récupération directe depuis Supabase
      const { data: organizationsData, error: orgError } = await supabase
        .from('organizations') // Vérifiez le nom exact de votre table
        .select('id, name, code, description')
        .order('name', { ascending: true });

      if (orgError) throw orgError;

      // Vérification du rôle super admin (ajustez selon votre logique)
      const { data: { user } } = await supabase.auth.getUser();
      const isSuper = user?.email?.endsWith('@admin.com'); // Exemple basique

      setOrganizations(organizationsData || []);
      setIsSuperAdmin(isSuper || false);

      if (organizationsData?.length === 1) {
        setSelectedOrgId(organizationsData[0].id);
      }

    } catch (error: any) {
      console.error('Erreur récupération organisations:', error);
      setError(error.message || 'Erreur lors du chargement des organisations');
      toast.error('Impossible de charger les organisations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrgId) {
      setError('Veuillez sélectionner une organisation');
      return;
    }

    const selectedOrg = organizations.find(org => org.id === selectedOrgId);
    if (!selectedOrg) {
      setError('Organisation invalide');
      return;
    }

    if (!isSuperAdmin && !accessCode.trim()) {
      setError('Veuillez saisir le code d\'accès');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // En mode super admin, on saute la vérification du code
      if (!isSuperAdmin && selectedOrg.code !== accessCode.trim()) {
        throw new Error('Code d\'accès incorrect');
      }

      onSelect(selectedOrgId, selectedOrg.code);

    } catch (error: any) {
      setError(error.message || 'Erreur de validation');
      toast.error(error.message || 'Erreur lors de la sélection');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p>Chargement des organisations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (organizations.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="py-6 space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucune organisation disponible. Contactez votre administrateur.
            </AlertDescription>
          </Alert>
          <Button onClick={fetchOrganizations} variant="outline" className="w-full">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Sélection d'organisation
          {isSuperAdmin && (
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full ml-auto">
              Super Admin
            </span>
          )}
        </CardTitle>
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
            <Label>Organisation</Label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">Sélectionnez une organisation</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                  {org.description && ` - ${org.description}`}
                </option>
              ))}
            </select>
          </div>

          {!isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="accessCode">Code d'accès</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="pl-10"
                  placeholder="Code d'accès fourni par l'admin"
                  required
                />
              </div>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <Building className="h-4 w-4" />
                Accéder
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrganizationSelect;