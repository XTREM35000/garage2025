import React, { useState, useEffect } from 'react';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label} from '@/components/ui/label';
import { signInWithEmail, resendConfirmation } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CreateOrganisationForm from '@/components/CreateOrganisationForm';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);
  const navigate = useNavigate();
  const { user } = useSimpleAuth();
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowResendLink(false);

    try {
      const { user, session, error } = await signInWithEmail(email, password);
      if (error) {
        if (error.includes('Email non confirmé')) {
          setShowResendLink(true);
        }
        setError(error);
        return;
      }
      if (session) {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier le rôle de l'utilisateur après connexion
  useEffect(() => {
    if (user) {
      // Récupérer le rôle depuis les métadonnées utilisateur
      const role = user.user_metadata?.role || user.app_metadata?.role;
      setUserRole(role);
    }
  }, [user]);

  const handleResendConfirmation = async () => {
    try {
      setLoading(true);
      const { error } = await resendConfirmation(email);
      if (!error) {
        setError('');
        setShowResendLink(false);
        alert('Email de confirmation renvoyé !');
      } else {
        setError(error);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du renvoi';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Mot de passe</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Connexion...' : 'Se connecter'}
      </Button>

      {/* Bouton Créer une organisation - visible seulement pour les admins */}
      {userRole === 'admin' && (
        <div className="mt-4">
          <Dialog open={showCreateOrgModal} onOpenChange={setShowCreateOrgModal}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowCreateOrgModal(true)}
              >
                Créer une organisation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle organisation</DialogTitle>
              </DialogHeader>
              <CreateOrganisationForm 
                prefillEmail={user?.email || ''}
                onSuccess={() => setShowCreateOrgModal(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {showResendLink && (
        <div className="text-center">
          <Button
            variant="link"
            onClick={handleResendConfirmation}
            disabled={loading}
            className="text-sm"
          >
            Renvoyer l'email de confirmation
          </Button>
        </div>
      )}
    </form>
  );
};

export default LoginForm;