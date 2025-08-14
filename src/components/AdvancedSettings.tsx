import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Trash2,
  Database,
  Shield,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Users,
  Car,
  Wrench,
  FileText
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import DeleteAllModal from './DeleteAllModal';

interface AdvancedSettingsProps {
  onDeleteAll: () => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ onDeleteAll }) => {
  const { isDark } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Récupérer les statistiques des données
  const getDataStats = () => {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const repairs = JSON.parse(localStorage.getItem('repairs') || '[]');
    const stock = JSON.parse(localStorage.getItem('stock') || '[]');

    return {
      clients: clients.length,
      vehicles: vehicles.length,
      repairs: repairs.length,
      stock: stock.length
    };
  };

  const stats = getDataStats();

  const handleBackup = async () => {
    setLoading(true);
    try {
      // Simulation de création de backup
      await new Promise(resolve => setTimeout(resolve, 2000));

      const backupData = {
        timestamp: new Date().toISOString(),
        garageData: localStorage.getItem('garageData'),
        userData: localStorage.getItem('user'),
        clients: localStorage.getItem('clients'),
        vehicles: localStorage.getItem('vehicles'),
        repairs: localStorage.getItem('repairs'),
        stock: localStorage.getItem('stock'),
        config: localStorage.getItem('garageConfig')
      };

      // Créer un fichier de backup téléchargeable
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `garage-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors du backup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setLoading(true);
        try {
          const text = await file.text();
          const backupData = JSON.parse(text);

          // Restaurer les données
          Object.entries(backupData).forEach(([key, value]) => {
            if (key !== 'timestamp' && value) {
              localStorage.setItem(key, value as string);
            }
          });

          // Recharger la page pour appliquer les changements
          window.location.reload();
        } catch (error) {
          console.error('Erreur lors de la restauration:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Paramètres Avancés
        </h2>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Gestion des données et configuration système
        </p>
      </div>

      {/* Statistiques des données */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${isDark ? 'text-white' : ''}`}>
            <Database className="w-5 h-5" />
            <span>Statistiques des Données</span>
          </CardTitle>
          <CardDescription className={isDark ? 'text-gray-300' : ''}>
            Aperçu des données stockées dans votre garage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Clients</span>
              </div>
              <p className="text-2xl font-bold text-blue-500">{stats.clients}</p>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <Car className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Véhicules</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{stats.vehicles}</p>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <Wrench className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Réparations</span>
              </div>
              <p className="text-2xl font-bold text-purple-500">{stats.repairs}</p>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Stock</span>
              </div>
              <p className="text-2xl font-bold text-orange-500">{stats.stock}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup et Restauration */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${isDark ? 'text-white' : ''}`}>
            <Shield className="w-5 h-5" />
            <span>Sauvegarde et Restauration</span>
          </CardTitle>
          <CardDescription className={isDark ? 'text-gray-300' : ''}>
            Protégez vos données avec des sauvegardes régulières
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button
              onClick={handleBackup}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Créer un Backup</span>
            </Button>

            <Button
              onClick={handleRestore}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Restaurer un Backup</span>
            </Button>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Créez des sauvegardes régulières pour protéger vos données.
              Les backups incluent tous les clients, véhicules, réparations et stocks.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Réinitialisation */}
      <Card className={`border-red-200 ${isDark ? 'bg-gray-800 border-red-700' : 'bg-red-50'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${isDark ? 'text-white' : 'text-red-800'}`}>
            <AlertTriangle className="w-5 h-5" />
            <span>Zone Dangereuse</span>
          </CardTitle>
          <CardDescription className={isDark ? 'text-gray-300' : 'text-red-600'}>
            Actions irréversibles - Utilisez avec précaution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>ATTENTION :</strong> La réinitialisation complète supprimera définitivement
              toutes vos données. Cette action ne peut pas être annulée.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
            <div>
              <h4 className="font-semibold text-red-800">Réinitialisation Complète</h4>
              <p className="text-sm text-red-600">
                Supprime TOUTES les données : clients, véhicules, réparations, stock, configuration
              </p>
            </div>

            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer TOUT</span>
            </Button>
          </div>

          <div className="text-xs text-red-600">
            <strong>Conservé :</strong> Comptes administrateurs (pour éviter le lockout)
          </div>
        </CardContent>
      </Card>

      {/* Modal de suppression */}
      <DeleteAllModal
        isOpen={showDeleteModal}
        onConfirm={() => {
          setShowDeleteModal(false);
          onDeleteAll();
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AdvancedSettings;
