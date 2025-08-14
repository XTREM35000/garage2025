import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(true);
  const navigate = useNavigate();

  const handleAuthSuccess = (user: any) => {
    console.log('✅ Authentification réussie:', user);
    toast.success('Connexion réussie !');
    navigate('/dashboard');
  };

  const handleAuthClose = () => {
    // Si l'utilisateur ferme le modal sans se connecter, rediriger vers la page d'accueil
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Garage Abidjan Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Connectez-vous pour accéder à votre espace de travail
        </p>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
};

export default AuthPage; 