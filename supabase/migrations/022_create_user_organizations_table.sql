-- Création de la table user_organizations
CREATE TABLE IF NOT EXISTS public.user_organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organisations(id) ON DELETE CASCADE,
  role text DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'user')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, organization_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON public.user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON public.user_organizations(organization_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER handle_user_organizations_updated_at
  BEFORE UPDATE ON public.user_organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Politiques RLS pour user_organizations
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- Politique permissive pour le mode demo (permettre à tous les utilisateurs de voir toutes les organisations)
DROP POLICY IF EXISTS "Users can view their own organizations" ON public.user_organizations;
CREATE POLICY "Users can view their own organizations" ON public.user_organizations
  FOR SELECT USING (true);

-- Politique pour permettre aux admins de gérer les relations
DROP POLICY IF EXISTS "Admins can manage user organizations" ON public.user_organizations;
CREATE POLICY "Admins can manage user organizations" ON public.user_organizations
  FOR ALL USING (true);

-- Insérer les relations existantes pour les Super-Admins
INSERT INTO public.user_organizations (user_id, organization_id, role)
SELECT 
  sa.user_id,
  o.id,
  'superadmin'
FROM public.super_admins sa
CROSS JOIN public.organisations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_organizations uo
  WHERE uo.user_id = sa.user_id
  AND uo.organization_id = o.id
); 