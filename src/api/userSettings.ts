import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

export const UserSettingsSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  locale: z.string().min(2).max(10).default('fr-FR'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications_enabled: z.boolean().default(true),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') return { data: null, error };
  return { data: data as UserSettings | null, error: null };
};

export const upsertUserSettings = async (settings: UserSettings) => {
  const parsed = UserSettingsSchema.safeParse(settings);
  if (!parsed.success) {
    return { data: null, error: new Error('Validation échouée') };
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(parsed.data, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) return { data: null, error };
  return { data: data as UserSettings, error: null };
};

export const updateUserSettings = async (userId: string, partial: Partial<UserSettings>) => {
  const { data, error } = await supabase
    .from('user_settings')
    .update(partial)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) return { data: null, error };
  return { data: data as UserSettings, error: null };
};