import { useState, useEffect, useCallback } from 'react';
import { isConfigurationComplete, getGarageConfig, saveGarageConfig } from '@/lib/config';

interface GarageConfig {
  garageName: string;
  ownerName: string;
  logo: string | null;
  address: string;
  phone: string;
  email?: string;
  rccm?: string;
  taxRegime?: 'reel' | 'simplifie';
  taxId?: string;
  cni?: string;
}

interface BrainSetupState {
  isFirstLaunch: boolean;
  isConfigured: boolean;
  showBrainModal: boolean;
  showDeleteAllModal: boolean;
  config: GarageConfig | null;
}

export const useBrainSetup = () => {
  const [state, setState] = useState<BrainSetupState>({
    isFirstLaunch: false,
    isConfigured: false,
    showBrainModal: false,
    showDeleteAllModal: false,
    config: null
  });

  const checkConfiguration = useCallback(() => {
    const configured = isConfigurationComplete();
    const isFirstLaunch = !configured;

    setState(prev => ({
      ...prev,
      isFirstLaunch,
      isConfigured: configured,
      showBrainModal: isFirstLaunch,
      config: configured ? getGarageConfig() : null
    }));
  }, []);

  // Vérifier l'état de configuration au démarrage
  useEffect(() => {
    checkConfiguration();
  }, [checkConfiguration]);

  const handleBrainComplete = (config: GarageConfig) => {
    // Sauvegarder la configuration
    saveGarageConfig(config);

    // Créer les données de base du garage
    const garageData = {
      name: config.garageName,
      owner: config.ownerName,
      address: config.address,
      phone: config.phone,
      email: config.email,
      logo: config.logo,
      rccm: config.rccm,
      taxRegime: config.taxRegime,
      taxId: config.taxId,
      cni: config.cni,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('garageData', JSON.stringify(garageData));

    // Créer l'utilisateur admin par défaut pour la démo
    const userData = {
      name: config.ownerName || 'Thierry Gogo',
      email: config.email || 'thierry@garage-abidjan.com',
      role: 'Propriétaire',
      avatar: null,
      isAdmin: true, // Admin par défaut pour la démo
      permissions: ['all'], // Toutes les permissions
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('user', JSON.stringify(userData));

    setState(prev => ({
      ...prev,
      isConfigured: true,
      showBrainModal: false,
      config
    }));
  };

  const handleDeleteAll = () => {
    setState(prev => ({
      ...prev,
      showDeleteAllModal: true
    }));
  };

  const handleDeleteAllConfirm = () => {
    // Créer un backup avant suppression
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

    localStorage.setItem('backup_' + Date.now(), JSON.stringify(backupData));

    // Supprimer toutes les données sauf les comptes admin
    const keysToDelete = [
      'garageData',
      'clients',
      'vehicles',
      'repairs',
      'stock',
      'notifications',
      'settings',
      'brainCompleted',
      'garageConfig'
    ];

    keysToDelete.forEach(key => {
      localStorage.removeItem(key);
    });

    // Réinitialiser l'état
    setState({
      isFirstLaunch: true,
      isConfigured: false,
      showBrainModal: true,
      showDeleteAllModal: false,
      config: null
    });
  };

  const handleDeleteAllCancel = () => {
    setState(prev => ({
      ...prev,
      showDeleteAllModal: false
    }));
  };

  const resetToFirstLaunch = () => {
    localStorage.removeItem('brainCompleted');
    localStorage.removeItem('garageConfig');

    setState(prev => ({
      ...prev,
      isFirstLaunch: true,
      isConfigured: false,
      showBrainModal: true
    }));
  };

  return {
    ...state,
    handleBrainComplete,
    handleDeleteAll,
    handleDeleteAllConfirm,
    handleDeleteAllCancel,
    resetToFirstLaunch,
    checkConfiguration
  };
};
