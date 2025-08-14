-- Migration pour ajouter les politiques RLS pour les buckets de stockage
-- Date: 2024-01-01

-- Activer RLS sur les buckets de stockage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'upload de logos de garage (authentifiés)
CREATE POLICY "Allow authenticated users to upload garage logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'garage-logos'
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la lecture des logos de garage (public)
CREATE POLICY "Allow public to view garage logos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'garage-logos'
);

-- Politique pour permettre la mise à jour des logos de garage (authentifiés)
CREATE POLICY "Allow authenticated users to update garage logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'garage-logos'
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la suppression des logos de garage (authentifiés)
CREATE POLICY "Allow authenticated users to delete garage logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'garage-logos'
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre l'upload d'avatars utilisateur (authentifiés)
CREATE POLICY "Allow authenticated users to upload user avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars'
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la lecture des avatars utilisateur (public)
CREATE POLICY "Allow public to view user avatars" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-avatars'
);

-- Politique pour permettre la mise à jour des avatars utilisateur (authentifiés)
CREATE POLICY "Allow authenticated users to update user avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars'
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la suppression des avatars utilisateur (authentifiés)
CREATE POLICY "Allow authenticated users to delete user avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-avatars'
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre l'upload de photos de réparation (authentifiés)
CREATE POLICY "Allow authenticated users to upload repair photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'repair-photos'
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la lecture des photos de réparation (authentifiés)
CREATE POLICY "Allow authenticated users to view repair photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'repair-photos'
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la mise à jour des photos de réparation (authentifiés)
CREATE POLICY "Allow authenticated users to update repair photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'repair-photos'
  AND auth.role() = 'authenticated'
);

-- Politique pour permettre la suppression des photos de réparation (authentifiés)
CREATE POLICY "Allow authenticated users to delete repair photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'repair-photos'
  AND auth.role() = 'authenticated'
);

-- Politique générale pour permettre l'upload de fichiers (authentifiés)
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Politique générale pour permettre la lecture de fichiers (authentifiés)
CREATE POLICY "Allow authenticated users to view files" ON storage.objects
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- Politique générale pour permettre la mise à jour de fichiers (authentifiés)
CREATE POLICY "Allow authenticated users to update files" ON storage.objects
FOR UPDATE USING (
  auth.role() = 'authenticated'
);

-- Politique générale pour permettre la suppression de fichiers (authentifiés)
CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated'
);

-- Commentaire pour documenter les politiques
COMMENT ON POLICY "Allow authenticated users to upload garage logos" ON storage.objects IS 'Permet aux utilisateurs authentifiés d''uploader des logos de garage';
COMMENT ON POLICY "Allow public to view garage logos" ON storage.objects IS 'Permet au public de voir les logos de garage';
COMMENT ON POLICY "Allow authenticated users to upload user avatars" ON storage.objects IS 'Permet aux utilisateurs authentifiés d''uploader leurs avatars';
COMMENT ON POLICY "Allow public to view user avatars" ON storage.objects IS 'Permet au public de voir les avatars utilisateur';
COMMENT ON POLICY "Allow authenticated users to upload repair photos" ON storage.objects IS 'Permet aux utilisateurs authentifiés d''uploader des photos de réparation';
COMMENT ON POLICY "Allow authenticated users to view repair photos" ON storage.objects IS 'Permet aux utilisateurs authentifiés de voir les photos de réparation';
