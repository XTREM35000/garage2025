import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, CheckCircle, X, FileImage, AlertTriangle } from 'lucide-react';
import { validatePhotos, compressImage, generatePhotoFileName } from '@/utils/photoEvidence';

interface PhotoEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (photos: File[], signature?: string) => void;
  repairId: string;
  repairType: string;
  vehicleValue: number;
}

const PhotoEvidenceModal: React.FC<PhotoEvidenceModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  repairId,
  repairType,
  vehicleValue
}) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'photos' | 'signature'>('photos');
  const [signature, setSignature] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validation = validatePhotos(fileArray);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    setIsLoading(true);

    try {
      // Compresser les images
      const compressedPhotos = await Promise.all(
        fileArray.map(file => compressImage(file))
      );

      setPhotos(compressedPhotos);

      // Créer les previews
      const previews = compressedPhotos.map(file => URL.createObjectURL(file));
      setPhotoPreviews(previews);
    } catch (error) {
      setErrors(['Erreur lors du traitement des images']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraCapture = () => {
    // Ouvrir la caméra pour capture directe
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Implémentation de capture caméra (simplifiée pour l'exemple)
      fileInputRef.current?.click();
    } else {
      setErrors(['La caméra n\'est pas disponible sur cet appareil']);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Libérer la mémoire
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  const handleSignatureStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleSignatureMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    const canvas = signatureCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const handleSignatureEnd = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignature('');
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
    }
  };

  const handleNext = () => {
    if (photos.length >= 2) {
      setCurrentStep('signature');
    }
  };

  const handleComplete = () => {
    onComplete(photos, signature);
    onClose();
  };

  const handleClose = () => {
    // Nettoyer les previews
    photoPreviews.forEach(preview => URL.revokeObjectURL(preview));
    setPhotos([]);
    setPhotoPreviews([]);
    setErrors([]);
    setCurrentStep('photos');
    setSignature('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            Documentation Requise
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'photos' && (
          <div className="space-y-6">
            {/* Informations sur la réparation */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Documentation Obligatoire</h3>
                </div>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p><strong>Type de réparation :</strong> {repairType}</p>
                  <p><strong>Valeur du véhicule :</strong> {vehicleValue.toLocaleString('fr-FR')} FCFA</p>
                  <p><strong>Durée estimée :</strong> Plus de 24h</p>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-3 text-blue-800">📸 Photos Requises</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-blue-700">
                <li><strong>Plaque d'immatriculation</strong> - Vue claire et lisible</li>
                <li><strong>Dommage principal</strong> - Zoom sur la zone à réparer</li>
                <li><strong>Vue d'ensemble</strong> - Contexte du véhicule (optionnel)</li>
              </ol>
              <p className="mt-3 text-xs text-blue-600">
                Ces photos protègent votre garage et votre client en cas de litige.
              </p>
            </div>

            {/* Upload des photos */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isLoading ? 'Traitement...' : 'Choisir des photos'}
                </Button>
                <Button
                  onClick={handleCameraCapture}
                  variant="outline"
                  disabled={isLoading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Caméra
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              {/* Erreurs */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul className="list-disc pl-4">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Prévisualisation des photos */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <Badge className="absolute bottom-2 left-2">
                        {index === 0 ? 'Plaque' : index === 1 ? 'Dommage' : 'Vue générale'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Statut */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-5 h-5 ${photos.length >= 2 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm">
                    {photos.length}/2 photos requises
                  </span>
                </div>
                <Button
                  onClick={handleNext}
                  disabled={photos.length < 2}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'signature' && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-green-800">✅ Photos Validées</h3>
              <p className="text-sm text-green-700">
                Les photos ont été enregistrées. Le client doit maintenant signer pour confirmer.
              </p>
            </div>

            {/* Zone de signature */}
            <div className="space-y-3">
              <h3 className="font-semibold">Signature du Client</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <canvas
                  ref={signatureCanvasRef}
                  width={300}
                  height={150}
                  className="border rounded-md cursor-crosshair bg-white"
                  onMouseDown={handleSignatureStart}
                  onMouseMove={handleSignatureMove}
                  onMouseUp={handleSignatureEnd}
                  onMouseLeave={handleSignatureEnd}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={clearSignature}
                  variant="outline"
                  size="sm"
                >
                  Effacer
                </Button>
                <Button
                  onClick={saveSignature}
                  size="sm"
                >
                  Sauvegarder
                </Button>
              </div>
            </div>

            {/* Actions finales */}
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setCurrentStep('photos')}
                variant="outline"
              >
                Retour
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!signature}
              >
                Terminer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PhotoEvidenceModal;
