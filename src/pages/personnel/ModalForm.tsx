import React, { useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type PersonnelFormInputs = {
  id?: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  avatar_url?: string | null;
};

const PersonnelSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().min(2, 'Nom complet requis'),
  email: z.string().email('Email invalide'),
  phone: z
    .string()
    .trim()
    .min(7, 'Numéro invalide')
    .max(20, 'Numéro invalide')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  role: z.string().min(2, 'Rôle requis'),
  avatar_url: z.string().url('URL invalide').optional(),
});

export interface PersonnelModalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<PersonnelFormInputs>;
  onSuccess?: (user: PersonnelFormInputs) => void;
}

const DEFAULT_VALUES: PersonnelFormInputs = {
  full_name: '',
  email: '',
  phone: '',
  role: 'user',
  avatar_url: undefined,
};

export const ModalForm: React.FC<PersonnelModalFormProps> = ({ open, onOpenChange, initialValues, onSuccess }) => {
  const form = useForm<PersonnelFormInputs>({
    resolver: zodResolver(PersonnelSchema),
    defaultValues: { ...DEFAULT_VALUES, ...(initialValues || {}) },
    mode: 'onSubmit',
  });

  const isEditing = useMemo(() => !!initialValues?.id, [initialValues?.id]);

  const onSubmit = async (values: PersonnelFormInputs) => {
    try {
      const payload: Partial<PersonnelFormInputs> = {
        full_name: values.full_name,
        email: values.email,
        role: values.role,
        phone: values.phone || null,
        avatar_url: values.avatar_url || null,
      };

      let data: any = null;
      let error: any = null;

      if (isEditing && values.id) {
        const result = await supabase
          .from('users')
          .update(payload)
          .eq('id', values.id)
          .select('id, full_name, email, phone, role, avatar_url')
          .single();

        data = result.data;
        error = result.error;
      } else {
        // Création: nécessite des contraintes (password_hash). On fait un upsert si id fourni (sinon erreur côté RLS/NOT NULL)
        const result = await supabase
          .from('users')
          .insert(payload)
          .select('id, full_name, email, phone, role, avatar_url')
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) {
        toast.error(`Erreur: ${error.message || 'Opération échouée'}`);
        return;
      }

      toast.success(isEditing ? 'Membre mis à jour' : 'Membre créé');
      if (onSuccess && data) onSuccess(data as PersonnelFormInputs);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || 'Erreur inattendue');
    }
  };

  const loading = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier un membre' : 'Ajouter un membre'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom complet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemple.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="0700000000" {...field} />
                    </FormControl>
                    <FormDescription>Optionnel</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Utilisateur</SelectItem>
                          <SelectItem value="mecanicien">Mécanicien</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="proprietaire">Propriétaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>Optionnel</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  isEditing ? 'Mettre à jour' : 'Créer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalForm;