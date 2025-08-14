-- Migration pour corriger le cache du schéma de la table super_admins
-- Problème : "Could not find the 'est_actif' column of 'super_admins' in the schema cache"

-- 1. Vérifier et corriger la structure de la table super_admins
DO $$
BEGIN
    -- S'assurer que la table existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'super_admins') THEN
        CREATE TABLE public.super_admins (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            email TEXT NOT NULL,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            phone TEXT,
            est_actif BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Ajouter les colonnes manquantes si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'est_actif') THEN
        ALTER TABLE public.super_admins ADD COLUMN est_actif BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'user_id') THEN
        ALTER TABLE public.super_admins ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'email') THEN
        ALTER TABLE public.super_admins ADD COLUMN email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'nom') THEN
        ALTER TABLE public.super_admins ADD COLUMN nom TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'prenom') THEN
        ALTER TABLE public.super_admins ADD COLUMN prenom TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'phone') THEN
        ALTER TABLE public.super_admins ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'created_at') THEN
        ALTER TABLE public.super_admins ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'super_admins' AND column_name = 'updated_at') THEN
        ALTER TABLE public.super_admins ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Désactiver RLS temporairement pour corriger les politiques
ALTER TABLE public.super_admins DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "super_admins_insert_initial" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_select_simple" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_update_simple" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_delete_simple" ON public.super_admins;

-- 4. Créer des politiques RLS simples
CREATE POLICY "super_admins_insert_initial" ON public.super_admins
    FOR INSERT WITH CHECK (true);

CREATE POLICY "super_admins_select_simple" ON public.super_admins
    FOR SELECT USING (true);

CREATE POLICY "super_admins_update_simple" ON public.super_admins
    FOR UPDATE USING (true);

CREATE POLICY "super_admins_delete_simple" ON public.super_admins
    FOR DELETE USING (true);

-- 5. Réactiver RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- 6. Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.super_admins TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.super_admins TO authenticated;

-- 7. Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_super_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_super_admins_updated_at_trigger ON public.super_admins;
CREATE TRIGGER update_super_admins_updated_at_trigger
    BEFORE UPDATE ON public.super_admins
    FOR EACH ROW
    EXECUTE FUNCTION update_super_admins_updated_at();

-- 8. Fonction is_super_admin simplifiée
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.super_admins
        WHERE super_admins.user_id = user_id
        AND est_actif = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Permissions sur les fonctions
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO authenticated;

-- 10. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_super_admins_user_id ON public.super_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON public.super_admins(email);

-- 11. Forcer la mise à jour du cache du schéma
NOTIFY pgrst, 'reload schema';

-- 12. Commentaire
COMMENT ON TABLE public.super_admins IS 'Table des Super-Administrateurs de l''application (cache du schéma corrigé)';
