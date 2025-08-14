import { useState, useEffect } from 'react';

interface BrandConfig {
  id: string;
  garageName: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  setupComplete: boolean;
  currency: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminUser {
  id: string;
  email: string;
  phone: string;
  role: 'admin' | 'employee';
  isVerified: boolean;
  createdAt: string;
}

export const useBrandCheck = () => {
  const [isBrandConfigured, setIsBrandConfigured] = useState<boolean>(false);
  const [isAdminExists, setIsAdminExists] = useState<boolean>(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(false);
  const [brandConfig, setBrandConfig] = useState<BrandConfig | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkBrandAndAdminStatus();
  }, []);

  const checkBrandAndAdminStatus = async () => {
    try {
      setIsLoading(true);

      // Vérifier si c'est le premier lancement
      const hasLaunchedBefore = localStorage.getItem('garage_launched');
      if (!hasLaunchedBefore) {
        setIsFirstLaunch(true);
        setIsLoading(false);
        return;
      }

      // Vérifier la configuration du brand
      const storedBrandConfig = localStorage.getItem('brandConfig');
      if (storedBrandConfig) {
        const config: BrandConfig = JSON.parse(storedBrandConfig);
        setBrandConfig(config);
        setIsBrandConfigured(config.setupComplete);
      }

      // Vérifier si un admin existe
      const storedAdmin = localStorage.getItem('adminUser');
      if (storedAdmin) {
        const admin: AdminUser = JSON.parse(storedAdmin);
        setAdminUser(admin);
        setIsAdminExists(true);
      }

    } catch (error) {
      console.error('Erreur lors de la vérification du brand:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBrandConfig = async (config: Partial<BrandConfig>) => {
    try {
      const newConfig: BrandConfig = {
        id: brandConfig?.id || `brand_${Date.now()}`,
        garageName: config.garageName || '',
        logoUrl: config.logoUrl,
        address: config.address || '',
        phone: config.phone || '',
        email: config.email || '',
        setupComplete: true,
        currency: config.currency || 'XOF',
        language: config.language || 'FR',
        createdAt: brandConfig?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('brandConfig', JSON.stringify(newConfig));
      setBrandConfig(newConfig);
      setIsBrandConfigured(true);

      // Marquer que l'application a été lancée
      localStorage.setItem('garage_launched', 'true');
      setIsFirstLaunch(false);

      return { success: true, config: newConfig };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brand:', error);
      return { success: false, error };
    }
  };

  const saveAdminUser = async (adminData: Partial<AdminUser>) => {
    try {
      const newAdmin: AdminUser = {
        id: adminUser?.id || `admin_${Date.now()}`,
        email: adminData.email || '',
        phone: adminData.phone || '',
        role: 'admin',
        isVerified: adminData.isVerified || false,
        createdAt: adminUser?.createdAt || new Date().toISOString()
      };

      localStorage.setItem('adminUser', JSON.stringify(newAdmin));
      setAdminUser(newAdmin);
      setIsAdminExists(true);

      return { success: true, admin: newAdmin };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'admin:', error);
      return { success: false, error };
    }
  };

  const resetBrandSetup = () => {
    localStorage.removeItem('brandConfig');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('garage_launched');
    setIsBrandConfigured(false);
    setIsAdminExists(false);
    setIsFirstLaunch(true);
    setBrandConfig(null);
    setAdminUser(null);
  };

  return {
    isBrandConfigured,
    isAdminExists,
    isFirstLaunch,
    brandConfig,
    adminUser,
    isLoading,
    saveBrandConfig,
    saveAdminUser,
    resetBrandSetup,
    checkBrandAndAdminStatus
  };
};
