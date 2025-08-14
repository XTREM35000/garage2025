import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  AlertTriangle,
  Shield,
  Database,
  Users,
  Car,
  Wrench,
  FileText,
  Loader2,
  CheckCircle,
  X
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface DeleteAllModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteAllModal: React.FC<DeleteAllModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [backupCreated, setBackupCreated] = useState(false);

  const handleConfirm = async () => {
    if (confirmationText !== 'DELETE') return;

    setLoading(true);
    try {
      // Étape 1: Créer un backup
      if (!backupCreated) {
        await createBackup();
        setBackupCreated(true);
      }

      // Étape 2: Supprimer toutes les données
      await deleteAllData();

      // Étape 3: Réinitialiser la configuration
      await resetConfiguration();

      onConfirm();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (): Promise<void> => {
    // Simulation de création de backup
    await new Promise(resolve => setTimeout(resolve, 1500));

    const backupData = {
      timestamp: new Date().toISOString(),
      garageData: localStorage.getItem('garageData'),
      userData: localStorage.getItem('user'),
      clients: localStorage.getItem('clients'),
      vehicles: localStorage.getItem('vehicles'),
      repairs: localStorage.getItem('repairs'),
      stock: localStorage.getItem('stock')
    };

    localStorage.setItem('backup_' + Date.now(), JSON.stringify(backupData));
  };

  const deleteAllData = async (): Promise<void> => {
    // Simulation de suppression
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Supprimer toutes les données sauf les comptes admin
    const keysToDelete = [
      'garageData',
      'clients',
      'vehicles',
      'repairs',
      'stock',
      'notifications',
      'settings',
      'brainCompleted'
    ];

    keysToDelete.forEach(key => {
      localStorage.removeItem(key);
    });
  };

  const resetConfiguration = async (): Promise<void> => {
    // Simulation de réinitialisation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Supprimer la configuration
    localStorage.removeItem('garageConfig');
    localStorage.removeItem('brainCompleted');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-2xl ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader className="text-center border-b">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className={`text-2xl ${isDark ? 'text-white' : ''}`}>
            Réinitialisation Complète
          </CardTitle>
          <CardDescription className={isDark ? 'text-gray-300' : ''}>
            {step === 1 ? 'Confirmation requise' : 'Suppression en cours...'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Avertissement principal */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>ATTENTION :</strong> Cette action est irréversible et supprimera TOUTES les données de votre garage.
                </AlertDescription>
              </Alert>

              {/* Données qui seront supprimées */}
              <div>
                <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : ''}`}>
                  Données qui seront supprimées :
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Users className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Tous les clients</span>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Car className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Tous les véhicules</span>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Wrench className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Toutes les réparations</span>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Database className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Tout le stock</span>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <FileText className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Tous les rapports</span>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Shield className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Configuration</span>
                  </div>
                </div>
              </div>

              {/* Données conservées */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Conservé :</strong> Comptes administrateurs (pour éviter le lockout)
                </AlertDescription>
              </Alert>

              {/* Backup automatique */}
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-blue-700">Backup automatique</span>
                </div>
                <p className="text-sm text-blue-600">
                  Un backup de vos données sera créé automatiquement avant la suppression.
                </p>
              </div>

              {/* Confirmation finale */}
              <div>
                <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : ''}`}>
                  Confirmation finale
                </h4>
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Pour confirmer cette action, tapez <strong>DELETE</strong> dans le champ ci-dessous :
                </p>
                <Input
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Tapez DELETE pour confirmer"
                  className={confirmationText !== 'DELETE' && confirmationText.length > 0 ? 'border-red-500' : ''}
                />
                {confirmationText !== 'DELETE' && confirmationText.length > 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    Le texte doit être exactement "DELETE"
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : ''}`}>
                  Suppression en cours...
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Veuillez patienter pendant que nous supprimons toutes les données.
                </p>
              </div>

              {/* Étapes de suppression */}
              <div className="space-y-3">
                <div className={`flex items-center space-x-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">Création du backup...</span>
                </div>

                <div className={`flex items-center space-x-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <span className="text-sm">Suppression des données...</span>
                </div>

                <div className={`flex items-center space-x-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">Réinitialisation de la configuration...</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step === 1 && (
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Annuler</span>
              </Button>

              <Button
                onClick={() => setStep(2)}
                disabled={confirmationText !== 'DELETE'}
                className="bg-red-600 hover:bg-red-700 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer TOUT</span>
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="pt-6 border-t">
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Suppression en cours...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Confirmer la suppression
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteAllModal;
