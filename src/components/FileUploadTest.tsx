import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { FileService } from '@/integrations/supabase/fileService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FileUploadTest: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleUpload = async (file: File) => {
    console.log('=== DEBUG UPLOAD ===');
    console.log('File name:', file.name);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    console.log('File lastModified:', file.lastModified);

    setDebugInfo({
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    try {
      const result = await FileService.uploadGarageLogo(file, 'test-garage');
      console.log('Upload result:', result);
      setLogoUrl(result);
      return { success: true, url: result };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  };

  const handleRemove = () => {
    setLogoUrl('');
    setDebugInfo(null);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Upload de Fichiers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            label="Logo du garage (Test)"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            maxSize={2 * 1024 * 1024}
            onUpload={handleUpload as (file: File) => Promise<{ success: boolean; url?: string; error?: string; }>}
            onRemove={handleRemove}
            currentUrl={logoUrl}
            required
          />

          {debugInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Informations de débogage :</h3>
              <pre className="text-sm">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          {logoUrl && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg">
              <h3 className="font-semibold mb-2">URL du fichier :</h3>
              <p className="text-sm break-all">{logoUrl}</p>
              <img
                src={logoUrl}
                alt="Logo uploadé"
                className="mt-2 max-w-32 max-h-32 rounded border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions de Test</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Préparez une image PNG, JPG ou SVG (moins de 2MB)</li>
            <li>Cliquez sur "Choisir un fichier" ou glissez-déposez</li>
            <li>Vérifiez les informations de débogage ci-dessous</li>
            <li>Si l'upload échoue, vérifiez la console du navigateur</li>
            <li>Vérifiez que les buckets Supabase sont créés</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
