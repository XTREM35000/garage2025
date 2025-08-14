import { useState, useCallback } from 'react';
import { PhotoEvidence } from '@/utils/photoEvidence';

interface UsePhotoEvidenceReturn {
  photoEvidence: PhotoEvidence | null;
  savePhotoEvidence: (repairId: string, photos: File[], signature?: string) => Promise<void>;
  getPhotoEvidence: (repairId: string) => PhotoEvidence | null;
  hasPhotoEvidence: (repairId: string) => boolean;
  clearPhotoEvidence: (repairId: string) => void;
}

export const usePhotoEvidence = (): UsePhotoEvidenceReturn => {
  const [photoEvidence, setPhotoEvidence] = useState<PhotoEvidence | null>(null);

  const savePhotoEvidence = useCallback(async (
    repairId: string,
    photos: File[],
    signature?: string
  ) => {
    try {
      // En production, uploader vers Supabase Storage
      const evidence: PhotoEvidence = {
        repairId,
        photos,
        timestamp: new Date(),
        signature
      };

      // Sauvegarder localement pour la démo
      const existingEvidence = localStorage.getItem('photoEvidence');
      const allEvidence = existingEvidence ? JSON.parse(existingEvidence) : {};
      allEvidence[repairId] = evidence;

      localStorage.setItem('photoEvidence', JSON.stringify(allEvidence));
      setPhotoEvidence(evidence);

      console.log('Preuves photo sauvegardées pour la réparation:', repairId);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des preuves photo:', error);
      throw error;
    }
  }, []);

  const getPhotoEvidence = useCallback((repairId: string): PhotoEvidence | null => {
    try {
      const existingEvidence = localStorage.getItem('photoEvidence');
      if (!existingEvidence) return null;

      const allEvidence = JSON.parse(existingEvidence);
      return allEvidence[repairId] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération des preuves photo:', error);
      return null;
    }
  }, []);

  const hasPhotoEvidence = useCallback((repairId: string): boolean => {
    return getPhotoEvidence(repairId) !== null;
  }, [getPhotoEvidence]);

  const clearPhotoEvidence = useCallback((repairId: string) => {
    try {
      const existingEvidence = localStorage.getItem('photoEvidence');
      if (!existingEvidence) return;

      const allEvidence = JSON.parse(existingEvidence);
      delete allEvidence[repairId];

      localStorage.setItem('photoEvidence', JSON.stringify(allEvidence));
      setPhotoEvidence(null);
    } catch (error) {
      console.error('Erreur lors de la suppression des preuves photo:', error);
    }
  }, []);

  return {
    photoEvidence,
    savePhotoEvidence,
    getPhotoEvidence,
    hasPhotoEvidence,
    clearPhotoEvidence
  };
};
