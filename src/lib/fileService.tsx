import { supabase } from '@/integrations/supabase/client';

export const FileService = {
  async uploadUserAvatar(file: File, userId: string) {
    try {
      // Vérifications de sécurité
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('L\'image ne doit pas dépasser 5MB');
      }

      // Créer un nom de fichier unique avec timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload avec l'option upsert
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Permet de remplacer le fichier existant
        });

      if (error) throw error;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;

    } catch (error) {
      console.error('Erreur upload avatar:', error);
      throw error;
    }
  }
};