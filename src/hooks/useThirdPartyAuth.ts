import { useState, useEffect } from 'react';
import { ThirdPartyData } from '@/components/ThirdPartyForm';

export interface ThirdPartyAuthorization {
  id: string;
  repairId?: string;
  ownerId?: string;
  thirdPartyName: string;
  thirdPartyPhone: string;
  cniPhotoPath?: string;
  smsCode: string;
  validatedAt?: Date;
  expiresAt: Date;
  vehicleInfo: {
    marque: string;
    modele: string;
    immatriculation: string;
  };
  restrictions?: string;
  status: 'pending' | 'validated' | 'expired' | 'rejected';
  createdAt: Date;
}

const STORAGE_KEY = 'third_party_authorizations';

export const useThirdPartyAuth = () => {
  const [authorizations, setAuthorizations] = useState<ThirdPartyAuthorization[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les autorisations depuis localStorage
  useEffect(() => {
    const loadAuthorizations = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convertir les dates string en objets Date
          const withDates = parsed.map((auth: any) => ({
            ...auth,
            createdAt: new Date(auth.createdAt),
            expiresAt: new Date(auth.expiresAt),
            validatedAt: auth.validatedAt ? new Date(auth.validatedAt) : undefined
          }));
          setAuthorizations(withDates);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des autorisations:', error);
      }
    };

    loadAuthorizations();
  }, []);

  // Sauvegarder les autorisations dans localStorage
  const saveAuthorizations = (newAuthorizations: ThirdPartyAuthorization[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthorizations));
      setAuthorizations(newAuthorizations);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des autorisations:', error);
    }
  };

  // Créer une nouvelle autorisation
  const createAuthorization = async (data: ThirdPartyData): Promise<ThirdPartyAuthorization> => {
    setIsLoading(true);

    try {
      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      const newAuthorization: ThirdPartyAuthorization = {
        id: `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        thirdPartyName: data.thirdPartyName,
        thirdPartyPhone: data.thirdPartyPhone,
        cniPhotoPath: data.cniPhoto ? `cni_${Date.now()}.jpg` : undefined,
        smsCode,
        expiresAt,
        vehicleInfo: data.vehicleInfo,
        restrictions: data.restrictions,
        status: 'pending',
        createdAt: new Date()
      };

      const updatedAuthorizations = [...authorizations, newAuthorization];
      saveAuthorizations(updatedAuthorizations);

      // Simuler l'envoi SMS
      console.log(`SMS envoyé au ${data.ownerPhone}: [Garage 2024] ${data.vehicleInfo.marque} ${data.vehicleInfo.modele} (${data.vehicleInfo.immatriculation}) - Code: ${smsCode} - Valide 24h`);

      return newAuthorization;
    } catch (error) {
      console.error('Erreur lors de la création de l\'autorisation:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Valider une autorisation avec le code SMS
  const validateAuthorization = async (authId: string, smsCode: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const authIndex = authorizations.findIndex(auth => auth.id === authId);
      if (authIndex === -1) {
        throw new Error('Autorisation non trouvée');
      }

      const auth = authorizations[authIndex];

      // Vérifier si le code est correct
      if (auth.smsCode !== smsCode) {
        return false;
      }

      // Vérifier si l'autorisation n'a pas expiré
      if (new Date() > auth.expiresAt) {
        const updatedAuthorizations = [...authorizations];
        updatedAuthorizations[authIndex] = { ...auth, status: 'expired' };
        saveAuthorizations(updatedAuthorizations);
        return false;
      }

      // Valider l'autorisation
      const updatedAuthorizations = [...authorizations];
      updatedAuthorizations[authIndex] = {
        ...auth,
        status: 'validated',
        validatedAt: new Date()
      };
      saveAuthorizations(updatedAuthorizations);

      return true;
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Rejeter une autorisation
  const rejectAuthorization = async (authId: string): Promise<void> => {
    setIsLoading(true);

    try {
      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 500));

      const authIndex = authorizations.findIndex(auth => auth.id === authId);
      if (authIndex === -1) {
        throw new Error('Autorisation non trouvée');
      }

      const auth = authorizations[authIndex];
      const updatedAuthorizations = [...authorizations];
      updatedAuthorizations[authIndex] = { ...auth, status: 'rejected' };
      saveAuthorizations(updatedAuthorizations);

      console.log(`Autorisation rejetée pour ${auth.thirdPartyName}`);
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Renvoyer un nouveau code SMS
  const resendSmsCode = async (authId: string): Promise<string> => {
    setIsLoading(true);

    try {
      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const authIndex = authorizations.findIndex(auth => auth.id === authId);
      if (authIndex === -1) {
        throw new Error('Autorisation non trouvée');
      }

      const auth = authorizations[authIndex];
      const newSmsCode = Math.floor(100000 + Math.random() * 900000).toString();
      const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      const updatedAuthorizations = [...authorizations];
      updatedAuthorizations[authIndex] = {
        ...auth,
        smsCode: newSmsCode,
        expiresAt: newExpiresAt,
        status: 'pending'
      };
      saveAuthorizations(updatedAuthorizations);

      // Simuler l'envoi du nouveau SMS
      console.log(`Nouveau SMS envoyé: Code ${newSmsCode} pour ${auth.thirdPartyName}`);

      return newSmsCode;
    } catch (error) {
      console.error('Erreur lors du renvoi du SMS:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir une autorisation par ID
  const getAuthorizationById = (authId: string): ThirdPartyAuthorization | undefined => {
    return authorizations.find(auth => auth.id === authId);
  };

  // Obtenir les autorisations en attente
  const getPendingAuthorizations = (): ThirdPartyAuthorization[] => {
    return authorizations.filter(auth => auth.status === 'pending');
  };

  // Obtenir les autorisations validées
  const getValidatedAuthorizations = (): ThirdPartyAuthorization[] => {
    return authorizations.filter(auth => auth.status === 'validated');
  };

  // Nettoyer les autorisations expirées
  const cleanupExpiredAuthorizations = (): void => {
    const now = new Date();
    const validAuthorizations = authorizations.filter(auth => {
      if (auth.status === 'pending' && now > auth.expiresAt) {
        return false; // Supprimer les autorisations en attente expirées
      }
      return true;
    });

    if (validAuthorizations.length !== authorizations.length) {
      const updatedAuthorizations = validAuthorizations.map(auth => {
        if (auth.status === 'pending' && now > auth.expiresAt) {
          return { ...auth, status: 'expired' as const };
        }
        return auth;
      });
      saveAuthorizations(updatedAuthorizations);
    }
  };

  // Nettoyer automatiquement les autorisations expirées
  useEffect(() => {
    const interval = setInterval(cleanupExpiredAuthorizations, 60000); // Toutes les minutes
    return () => clearInterval(interval);
  }, [authorizations]);

  return {
    authorizations,
    isLoading,
    createAuthorization,
    validateAuthorization,
    rejectAuthorization,
    resendSmsCode,
    getAuthorizationById,
    getPendingAuthorizations,
    getValidatedAuthorizations,
    cleanupExpiredAuthorizations
  };
};
