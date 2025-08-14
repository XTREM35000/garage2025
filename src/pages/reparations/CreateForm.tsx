import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CreateReparationSchema = z.object({
  vehicule_id: z.string().uuid({ message: 'Véhicule requis' }),
  client_id: z.string().uuid({ message: 'Client requis' }),
  description: z.string().min(5, 'Description requise'),
  statut: z.enum(['En attente', 'En cours', 'Terminé', 'Annulé', 'Facturé']).default('En attente'),
  prix: z.coerce.number().min(0, 'Prix invalide'),
  date_debut: z.string().min(1, 'Date de début requise'),
  date_fin: z.string().optional(),
  technicien_id: z.string().uuid().optional(),
  priorite: z.enum(['Basse', 'Normale', 'Haute', 'Urgente']).default('Normale'),
  notes: z.string().optional(),
});

export type CreateReparationInputs = z.infer<typeof CreateReparationSchema>;

interface CreateFormProps {
  onCreated?: (id: string) => void;
}

const CreateForm: React.FC<CreateFormProps> = ({ onCreated }) => {
  const form = useForm<CreateReparationInputs>({
    resolver: zodResolver(CreateReparationSchema),
    defaultValues: {
      statut: 'En attente',
      priorite: 'Normale',
      prix: 0,
      date_debut: new Date().toISOString(),
    },
  });

  const onSubmit = async (values: CreateReparationInputs) => {
    try {
      const { data, error } = await supabase
        .from('reparations')
        .insert({
          vehicule_id: values.vehicule_id,
          client_id: values.client_id,
          description: values.description,
          statut: values.statut,
          prix: values.prix,
          date_debut: values.date_debut,
          date_fin: values.date_fin || null,
          technicien_id: values.technicien_id || null,
          priorite: values.priorite,
          notes: values.notes || null,
        })
        .select('id')
        .single();

      if (error) {
        toast.error(error.message || 'Erreur lors de la création');
        return;
      }

      toast.success('Réparation créée');
      form.reset();
      if (onCreated && data?.id) onCreated(String(data.id));
    } catch (e: any) {
      toast.error(e?.message || 'Erreur inattendue');
    }
  };

  const loading = form.formState.isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer une réparation</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicule_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Véhicule ID</FormLabel>
                    <FormControl>
                      <Input placeholder="UUID du véhicule" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client ID</FormLabel>
                    <FormControl>
                      <Input placeholder="UUID du client" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description de la réparation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="En attente">En attente</SelectItem>
                          <SelectItem value="En cours">En cours</SelectItem>
                          <SelectItem value="Terminé">Terminé</SelectItem>
                          <SelectItem value="Annulé">Annulé</SelectItem>
                          <SelectItem value="Facturé">Facturé</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priorite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basse">Basse</SelectItem>
                          <SelectItem value="Normale">Normale</SelectItem>
                          <SelectItem value="Haute">Haute</SelectItem>
                          <SelectItem value="Urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date_debut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de début</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_fin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de fin</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>Optionnel</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="technicien_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technicien (ID)</FormLabel>
                  <FormControl>
                    <Input placeholder="UUID technicien" {...field} />
                  </FormControl>
                  <FormDescription>Optionnel</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateForm;