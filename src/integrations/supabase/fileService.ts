import { supabase } from '@/integrations/supabase/client';

export const FileService = {
  async uploadUserAvatar(file: File, userId: string): Promise<string> {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('L\'image ne doit pas dépasser 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;

    } catch (error) {
      console.error('Erreur upload avatar:', error);
      throw error;
    }
  },

  async uploadGarageLogo(file: File, garageId: string): Promise<string> {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('L\'image ne doit pas dépasser 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${garageId}_${Date.now()}.${fileExt}`;
      const filePath = `garages/${fileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;

    } catch (error) {
      console.error('Erreur upload logo garage:', error);
      throw error;
    }
  }
};