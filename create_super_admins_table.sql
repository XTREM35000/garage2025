-- Script pour créer la table super_admins
-- Exécuter ce script dans votre base de données Supabase

-- 1. Créer la table super_admins si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.super_admins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Créer un index unique sur user_id pour s'assurer qu'un utilisateur ne peut être super_admin qu'une fois
CREATE UNIQUE INDEX IF NOT EXISTS idx_super_admins_user_id_unique 
    ON public.super_admins(user_id);

-- 3. Créer un index sur email
CREATE INDEX IF NOT EXISTS idx_super_admins_email 
    ON public.super_admins(email);

-- 4. Activer RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- 5. Créer une politique RLS simple
CREATE POLICY "Super admins can manage super admins"
    ON public.super_admins
    FOR ALL
    USING (auth.uid() = user_id);

-- 6. Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_super_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_super_admins_timestamp
    BEFORE UPDATE ON public.super_admins
    FOR EACH ROW
    EXECUTE FUNCTION update_super_admins_updated_at();

-- 7. Message de confirmation
SELECT 'Table super_admins créée avec succès!' as status;
