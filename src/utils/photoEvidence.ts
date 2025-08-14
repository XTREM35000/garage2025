// Utilitaires pour la gestion des preuves photo
export interface Repair {
  id: string;
  durationHours: number;
  type: string;
  vehicleValue: number;
  client: {
    isBlacklisted: boolean;
  };
}

export interface PhotoEvidence {
  repairId: string;
  photos: File[];
  timestamp: Date;
  signature?: string;
}

/**
 * Détermine si une réparation nécessite des preuves photo
 * selon les critères définis pour les petits garages
 */
export const needsPhotoEvidence = (repair: Repair): boolean => {
  const CONDITIONS = [
    repair.durationHours > 24, // Durée > 24h
    ['carrosserie', 'moteur'].includes(repair.type), // Type sensible
    repair.vehicleValue > 5000000, // Véhicule > 5M FCFA
    !repair.client.isBlacklisted // Client non blacklisté
  ];

  return CONDITIONS.every(Boolean);
};

/**
 * Valide les photos uploadées
 */
export const validatePhotos = (files: File[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (files.length < 2) {
    errors.push('Au moins 2 photos sont requises');
  }

  files.forEach((file, index) => {
    if (!file.type.startsWith('image/')) {
      errors.push(`Le fichier ${index + 1} n'est pas une image`);
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      errors.push(`L'image ${index + 1} est trop volumineuse (max 5MB)`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Génère le nom de fichier pour le stockage
 */
export const generatePhotoFileName = (repairId: string, photoType: 'plaque' | 'dommage', index: number): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${repairId}/${photoType}_${index}_${timestamp}.jpg`;
};

/**
 * Compresse une image pour optimiser le stockage
 */
export const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculer les nouvelles dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convertir en blob
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Fallback si la compression échoue
        }
      }, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
};
