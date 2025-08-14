-- Migration 025: Correction de la création d'organisations
-- Date: 2025-01-27
-- Description: Correction des problèmes de cohérence de schéma et de permissions RLS

-- 1. Nettoyer toutes les fonctions existantes (approche robuste)
DO $$
DECLARE
    func_oid oid;
    func_signature text;
BEGIN
    RAISE NOTICE '🧹 Nettoyage des fonctions create_organization_with_owner existantes...';
    
    -- Supprimer toutes les fonctions avec ce nom en utilisant leur OID
    FOR func_oid IN 
        SELECT p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'create_organization_with_owner'
    LOOP
        -- Obtenir la signature pour le log
        SELECT format('%s(%s)', p.proname, 
               CASE 
                   WHEN p.pronargs = 0 THEN ''
                   ELSE array_to_string(ARRAY(
                       SELECT format_type(t.oid, NULL)
                       FROM unnest(p.proargtypes) WITH ORDINALITY AS t(oid, ord)
                       ORDER BY t.ord
                   ), ', ')
               END)
        INTO func_signature
        FROM pg_proc p
        WHERE p.oid = func_oid;
        
        RAISE NOTICE 'Suppression de la fonction: % (OID: %)', func_signature, func_oid;
        
        -- Supprimer par OID pour éviter l'ambiguïté
        EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE', func_oid::regprocedure);
    END LOOP;
    
    RAISE NOTICE '✅ Nettoyage terminé';
END $$;

-- 2. Créer la fonction corrigée
CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
    org_name text,
    org_code text,
    org_slug text,
    org_email text,
    org_subscription_type text,
    owner_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_org_id uuid;
BEGIN
    -- Vérifier que l'utilisateur existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = owner_user_id) THEN
        RAISE EXCEPTION 'Utilisateur non trouvé: %', owner_user_id;
    END IF;
    
    -- Créer l'organisation
    INSERT INTO public.organisations (
        name,
        code,
        slug,
        email,
        subscription_type,
        is_active
    ) VALUES (
        org_name,
        org_code,
        org_slug,
        org_email,
        org_subscription_type,
        true
    ) RETURNING id INTO new_org_id;
    
    -- Créer la relation user_organizations avec le rôle superadmin
    INSERT INTO public.user_organizations (
        user_id,
        organization_id,
        role
    ) VALUES (
        owner_user_id,
        new_org_id,
        'superadmin'
    );
    
    RAISE NOTICE 'Organisation créée avec succès: % (ID: %)', org_name, new_org_id;
    RETURN new_org_id;
END;
$$;

-- 3. Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.create_organization_with_owner TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_organization_with_owner TO anon;

-- 4. Supprimer les anciennes politiques RLS pour organisations
DROP POLICY IF EXISTS "organisations_insert_policy" ON public.organisations;
DROP POLICY IF EXISTS "organisations_select_policy" ON public.organisations;
DROP POLICY IF EXISTS "organisations_update_policy" ON public.organisations;
DROP POLICY IF EXISTS "organisations_delete_policy" ON public.organisations;

-- 5. Créer les nouvelles politiques RLS pour organisations
CREATE POLICY "organisations_insert_policy" ON public.organisations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "organisations_select_policy" ON public.organisations
    FOR SELECT USING (true);

CREATE POLICY "organisations_update_policy" ON public.organisations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_organizations uo
            WHERE uo.organization_id = organisations.id
            AND uo.user_id = auth.uid()
            AND uo.role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "organisations_delete_policy" ON public.organisations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_organizations uo
            WHERE uo.organization_id = organisations.id
            AND uo.user_id = auth.uid()
            AND uo.role = 'superadmin'
        )
    );

-- 6. Supprimer les anciennes politiques RLS pour user_organizations
DROP POLICY IF EXISTS "user_organizations_insert_policy" ON public.user_organizations;
DROP POLICY IF EXISTS "user_organizations_select_policy" ON public.user_organizations;
DROP POLICY IF EXISTS "user_organizations_update_policy" ON public.user_organizations;
DROP POLICY IF EXISTS "user_organizations_delete_policy" ON public.user_organizations;

-- 7. Créer les nouvelles politiques RLS pour user_organizations
CREATE POLICY "user_organizations_insert_policy" ON public.user_organizations
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.user_organizations uo
            WHERE uo.organization_id = user_organizations.organization_id
            AND uo.user_id = auth.uid()
            AND uo.role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "user_organizations_select_policy" ON public.user_organizations
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.user_organizations uo
            WHERE uo.organization_id = user_organizations.organization_id
            AND uo.user_id = auth.uid()
        )
    );

CREATE POLICY "user_organizations_update_policy" ON public.user_organizations
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.user_organizations uo
            WHERE uo.organization_id = user_organizations.organization_id
            AND uo.user_id = auth.uid()
            AND uo.role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "user_organizations_delete_policy" ON public.user_organizations
    FOR DELETE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.user_organizations uo
            WHERE uo.organization_id = user_organizations.organization_id
            AND uo.user_id = auth.uid()
            AND uo.role = 'superadmin'
        )
    );

-- 8. Vérifications de schéma post-migration
DO $$
DECLARE
    func_exists boolean;
    table_exists boolean;
    rls_enabled boolean;
    policies_count integer;
BEGIN
    RAISE NOTICE '🔍 Vérifications post-migration...';
    
    -- Vérifier que la fonction a été créée
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'create_organization_with_owner'
        AND routine_schema = 'public'
    ) INTO func_exists;
    
    IF NOT func_exists THEN
        RAISE EXCEPTION '❌ La fonction create_organization_with_owner n''a pas été créée';
    ELSE
        RAISE NOTICE '✅ Fonction create_organization_with_owner créée avec succès';
    END IF;
    
    -- Vérifier que la table user_organizations existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_organizations'
        AND table_schema = 'public'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE EXCEPTION '❌ La table user_organizations n''existe pas';
    ELSE
        RAISE NOTICE '✅ Table user_organizations existe';
    END IF;
    
    -- Vérifier que RLS est activé sur organisations
    SELECT relrowsecurity 
    FROM pg_class 
    WHERE relname = 'organisations' 
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    INTO rls_enabled;
    
    IF NOT rls_enabled THEN
        RAISE EXCEPTION '❌ RLS n''est pas activé sur organisations';
    ELSE
        RAISE NOTICE '✅ RLS activé sur organisations';
    END IF;
    
    -- Compter les politiques sur organisations
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE tablename = 'organisations' 
    AND schemaname = 'public'
    INTO policies_count;
    
    IF policies_count = 0 THEN
        RAISE EXCEPTION '❌ Aucune politique RLS sur organisations';
    ELSE
        RAISE NOTICE '✅ % politiques RLS créées sur organisations', policies_count;
    END IF;
    
    -- Vérifier la structure de user_organizations
    IF table_exists THEN
        -- Vérifier la colonne organization_id
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_organizations' 
            AND column_name = 'organization_id' 
            AND table_schema = 'public'
        ) THEN
            RAISE EXCEPTION '❌ Colonne organization_id manquante dans user_organizations';
        ELSE
            RAISE NOTICE '✅ Colonne organization_id présente dans user_organizations';
        END IF;
        
        -- Vérifier la colonne role
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_organizations' 
            AND column_name = 'role' 
            AND table_schema = 'public'
        ) THEN
            RAISE EXCEPTION '❌ Colonne role manquante dans user_organizations';
        ELSE
            RAISE NOTICE '✅ Colonne role présente dans user_organizations';
        END IF;
    END IF;
    
    RAISE NOTICE '✅ Toutes les vérifications de schéma sont passées';
END $$;
