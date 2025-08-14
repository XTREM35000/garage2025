-- Configuration du stockage Supabase pour les uploads de fichiers
-- Buckets et politiques pour les logos, avatars, et autres fichiers

-- ========================================
-- CRÉATION DES BUCKETS DE STOCKAGE
-- ========================================

-- Bucket pour les logos de garage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'garage-logos',
    'garage-logos',
    true,
    2097152, -- 2MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Bucket pour les avatars utilisateurs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-avatars',
    'user-avatars',
    true,
    2097152, -- 2MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Bucket pour les photos de réparations
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'repair-photos',
    'repair-photos',
    true,
    5242880, -- 5MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- ========================================
-- POLITIQUES DE STOCKAGE
-- ========================================

-- Politiques pour les logos de garage
CREATE POLICY "Logos de garage accessibles publiquement" ON storage.objects
    FOR SELECT USING (bucket_id = 'garage-logos');

CREATE POLICY "Utilisateurs authentifiés peuvent uploader des logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'garage-logos'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Propriétaires peuvent modifier leurs logos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'garage-logos'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Propriétaires peuvent supprimer leurs logos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'garage-logos'
        AND auth.role() = 'authenticated'
    );

-- Politiques pour les avatars utilisateurs
CREATE POLICY "Avatars accessibles publiquement" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Utilisateurs peuvent uploader leur avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Utilisateurs peuvent modifier leur avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Utilisateurs peuvent supprimer leur avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Politiques pour les photos de réparations
CREATE POLICY "Photos de réparations accessibles publiquement" ON storage.objects
    FOR SELECT USING (bucket_id = 'repair-photos');

CREATE POLICY "Utilisateurs authentifiés peuvent uploader des photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'repair-photos'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Utilisateurs peuvent modifier leurs photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'repair-photos'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Utilisateurs peuvent supprimer leurs photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'repair-photos'
        AND auth.role() = 'authenticated'
    );

-- ========================================
-- FONCTIONS UTILITAIRES POUR LES FICHIERS
-- ========================================

-- Fonction pour obtenir l'URL publique d'un fichier
CREATE OR REPLACE FUNCTION get_public_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://' || current_setting('app.settings.supabase_url') || '/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour uploader un logo de garage
CREATE OR REPLACE FUNCTION upload_garage_logo(
    file_name TEXT,
    file_content BYTEA,
    content_type TEXT
)
RETURNS TEXT AS $$
DECLARE
    file_path TEXT;
    file_url TEXT;
BEGIN
    -- Générer un nom de fichier unique
    file_path := 'logo_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || file_name;

    -- Insérer le fichier dans le bucket
    INSERT INTO storage.objects (bucket_id, name, owner, metadata)
    VALUES (
        'garage-logos',
        file_path,
        auth.uid(),
        jsonb_build_object(
            'contentType', content_type,
            'size', octet_length(file_content)
        )
    );

    -- Retourner l'URL publique
    RETURN get_public_url('garage-logos', file_path);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour uploader un avatar utilisateur
CREATE OR REPLACE FUNCTION upload_user_avatar(
    file_name TEXT,
    file_content BYTEA,
    content_type TEXT
)
RETURNS TEXT AS $$
DECLARE
    file_path TEXT;
    user_folder TEXT;
BEGIN
    -- Créer un dossier pour l'utilisateur
    user_folder := auth.uid()::TEXT || '/';
    file_path := user_folder || 'avatar_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || file_name;

    -- Insérer le fichier dans le bucket
    INSERT INTO storage.objects (bucket_id, name, owner, metadata)
    VALUES (
        'user-avatars',
        file_path,
        auth.uid(),
        jsonb_build_object(
            'contentType', content_type,
            'size', octet_length(file_content)
        )
    );

    -- Retourner l'URL publique
    RETURN get_public_url('user-avatars', file_path);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour supprimer un fichier
CREATE OR REPLACE FUNCTION delete_file(bucket_name TEXT, file_path TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM storage.objects
    WHERE bucket_id = bucket_name
    AND name = file_path
    AND owner = auth.uid();

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS POUR NETTOYER LES FICHIERS
-- ========================================

-- Fonction pour nettoyer les fichiers orphelins
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS VOID AS $$
BEGIN
    -- Supprimer les logos de garage orphelins
    DELETE FROM storage.objects
    WHERE bucket_id = 'garage-logos'
    AND created_at < NOW() - INTERVAL '1 hour'
    AND owner IS NULL;

    -- Supprimer les avatars orphelins
    DELETE FROM storage.objects
    WHERE bucket_id = 'user-avatars'
    AND created_at < NOW() - INTERVAL '1 hour'
    AND owner IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- DONNÉES DE DÉMONSTRATION POUR LES LOGOS
-- ========================================

-- Insérer un logo de démonstration (placeholder)
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
    'garage-logos',
    'demo-logo.png',
    NULL,
    jsonb_build_object(
        'contentType', 'image/png',
        'size', 1024,
        'demo', true
    )
) ON CONFLICT DO NOTHING;
