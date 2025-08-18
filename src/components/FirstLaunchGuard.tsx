import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logWorkflowInfo, logWorkflowError } from '@/utils/workflowLogger';
import SuperAdminSetupModal from './SuperAdminSetupModal';
import NormalWorkflow from './NormalWorkflow';
import { Loader2, Database, Shield, CheckCircle } from 'lucide-react';

interface FirstLaunchGuardProps {
  children: React.ReactNode;
}

const FirstLaunchGuard: React.FC<FirstLaunchGuardProps> = ({ children }) => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);

  // Vérifier si c'est le premier lancement
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        setIsLoading(true);
        logWorkflowInfo('Vérification du premier lancement...');

        // Vérifier s'il y a des super-admins
        const { count, error } = await supabase
          .from('super_admins')
          .select('*', { count: 'exact', head: true });

        if (error) {
          logWorkflowError('Erreur lors de la vérification du premier lancement', undefined, error);
          throw error;
        }

        const isFirst = count === 0;
        setIsFirstLaunch(isFirst);
        
        logWorkflowInfo(`Premier lancement détecté: ${isFirst}`, undefined, { 
          superAdminCount: count,
          isFirstLaunch: isFirst 
        });

      } catch (error) {
        logWorkflowError('Erreur critique lors de la vérification du premier lancement', undefined, error);
        // En cas d'erreur, considérer comme premier lancement pour la sécurité
        setIsFirstLaunch(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkFirstLaunch();
  }, []);

  // Gestion de la création du super-admin
  const handleSuperAdminCreated = () => {
    logWorkflowInfo('Super Admin créé avec succès, redémarrage obligatoire');
    
    // Afficher un message de confirmation
    setShowSuperAdminModal(false);
    
    // Attendre un peu avant le redémarrage pour que l'utilisateur voie le message
    setTimeout(() => {
      logWorkflowInfo('Redémarrage de l\'application...');
      window.location.reload();
    }, 2000);
  };

  // Affichage du loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center animate-pulse">
            <Database className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-800">
              Vérification du système
            </h2>
            <p className="text-slate-600">
              Analyse de l'état de l'application...
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
            <span className="text-blue-600">Vérification en cours</span>
          </div>
        </div>
      </div>
    );
  }

  // Premier lancement - Création du Super Admin
  if (isFirstLaunch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center space-y-8 max-w-2xl mx-auto px-6">
          {/* Header avec icône */}
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Shield className="w-16 h-16 text-white" />
          </div>

          {/* Titre et description */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Première Configuration
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Bienvenue ! C'est la première fois que vous utilisez cette application.
              Vous devez créer un compte Super Administrateur pour commencer.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note :</strong> Le Super Administrateur aura accès à toutes les fonctionnalités 
                et pourra créer d'autres comptes administrateurs.
              </p>
            </div>
          </div>

          {/* Bouton de création */}
          <button
            onClick={() => setShowSuperAdminModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Shield className="inline w-6 h-6 mr-2" />
            Créer le Super Administrateur
          </button>

          {/* Informations supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Configuration unique
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Sécurisé
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Redémarrage automatique
            </div>
          </div>
        </div>

        {/* Modal de création du Super Admin */}
        <SuperAdminSetupModal
          isOpen={showSuperAdminModal}
          onComplete={handleSuperAdminCreated}
          mode="super-admin"
          adminData={{
            email: '',
            password: '',
            phone: '',
            name: '',
            avatarFile: null
          }}
          onAdminDataChange={() => {}}
          showPassword={false}
          onToggleShowPassword={() => {}}
          isLoading={false}
        />
      </div>
    );
  }

  // Lancement normal - Workflow standard
  return <NormalWorkflow>{children}</NormalWorkflow>;
};

export default FirstLaunchGuard;
