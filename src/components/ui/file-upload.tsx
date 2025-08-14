import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // en bytes
  onUpload: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  onRemove?: () => void;
  currentUrl?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = "Fichier",
  accept = "image/*",
  maxSize = 2 * 1024 * 1024, // 2MB par défaut
  onUpload,
  onRemove,
  currentUrl,
  className,
  disabled = false,
  required = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Vérifier la taille
    if (file.size > maxSize) {
      return `Le fichier est trop volumineux. Taille maximum : ${Math.round(maxSize / 1024 / 1024)}MB`;
    }

    // Validation plus permissive des types
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    // Vérifier le type MIME mais être plus permissif
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    const hasValidMimeType = allowedMimeTypes.includes(file.type);

    if (!hasValidExtension && !hasValidMimeType) {
      return 'Type de fichier non supporté. Formats acceptés : PNG, JPG, SVG';
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validation du fichier
    const validationError = validateFile(file);
    if (validationError) {
      setUploadResult({
        success: false,
        error: validationError
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const result = await onUpload(file);
      setUploadResult(result);

      if (result.success) {
        // Reset après 3 secondes
        setTimeout(() => {
          setUploadResult(null);
        }, 3000);
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <Label className="text-base font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {/* Zone d'upload */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          currentUrl && "border-green-300 bg-green-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Contenu de la zone */}
        <div className="space-y-2">
          {currentUrl ? (
            // Fichier existant
            <div className="space-y-2">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
              <p className="text-sm text-green-600">Fichier uploadé avec succès</p>
              <img
                src={currentUrl}
                alt="Preview"
                className="max-w-32 max-h-32 mx-auto rounded"
              />
            </div>
          ) : isUploading ? (
            // Upload en cours
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="text-sm text-blue-600">Upload en cours...</p>
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            // Zone vide
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">
                Cliquez pour uploader ou glissez-déposez
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, SVG - Max {formatFileSize(maxSize)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choisir un fichier
        </Button>

        {currentUrl && onRemove && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        )}
      </div>

      {/* Messages de résultat */}
      {uploadResult && (
        <div className={cn(
          "p-3 rounded-lg flex items-center gap-2",
          uploadResult.success
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        )}>
          {uploadResult.success ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">
            {uploadResult.success ? "Upload réussi !" : uploadResult.error}
          </span>
        </div>
      )}
    </div>
  );
};
