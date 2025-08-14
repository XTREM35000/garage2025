import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Clock,
  RefreshCw,
  X,
  Check,
  Phone,
  Building,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface SmsValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (code?: string) => void | Promise<void>;
  onRefuse: (code?: string) => void | Promise<void>;
  organizationCode?: string;
  organizationName?: string;
  adminName?: string;
}

const SmsValidationModal: React.FC<SmsValidationModalProps> = ({
  isOpen,
  onClose,
  onValidate,
  onRefuse,
  organizationCode = 'ORG017791',
  organizationName = 'Système d\'initialisation',
  adminName = 'Admin Principal'
}) => {
  const [smsCode, setSmsCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes en secondes
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Timer countdown
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulation d'envoi de SMS
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTimeLeft(15 * 60); // Reset timer
      toast.success('Code SMS renvoyé avec succès !');
    } catch (error) {
      setError('Erreur lors de l\'envoi du code');
      toast.error('Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!smsCode || smsCode.length !== 6) {
      setError('Veuillez entrer un code SMS valide (6 chiffres)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (smsCode === '123456') { // Code de démonstration
        toast.success('Validation réussie !');
        onValidate();
      } else {
        setError('Code SMS incorrect');
        toast.error('Code SMS incorrect');
      }
    } catch (error) {
      setError('Erreur lors de la validation');
      toast.error('Erreur lors de la validation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefuse = () => {
    toast.info('Demande refusée');
    onRefuse();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Validation Propriétaire
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de la demande */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">
                Demande de Dépôt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Organisation :</span>
                <Badge variant="secondary" className="text-xs">
                  <Building className="mr-1 h-3 w-3" />
                  {organizationName}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Code Organisation :</span>
                <div className="flex items-center">
                  <Badge variant="outline" className="font-mono text-xs">
                    {organizationCode}
                  </Badge>
                  <span
                    role="button"
                    aria-label="Copier le code organisation"
                    title="Copier"
                    className="ml-2 cursor-pointer select-none"
                    style={{ fontSize: 20, lineHeight: '20px' }}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(organizationCode || '');
                        toast.success('Code copié dans le presse-papiers');
                      } catch (e) {
                        toast.error('Impossible de copier le code');
                      }
                    }}
                  >
                    📋
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Administrateur :</span>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-500" />
                  <span className="text-sm font-medium">{adminName}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code SMS */}
          <div className="space-y-3">
            <Label htmlFor="smsCode" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Code de Validation
            </Label>
            <p className="text-xs text-gray-600">
              Entrez le code reçu par SMS
            </p>

            <div className="space-y-2">
              <Input
                id="smsCode"
                type="text"
                placeholder="123456"
                value={smsCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').substring(0, 6);
                  setSmsCode(value);
                }}
                className="text-center text-lg font-mono tracking-widest"
                maxLength={6}
              />

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600 font-medium">
                  Expire dans : {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={isLoading || timeLeft > 0}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Renvoyer le code
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefuse}
                disabled={isLoading}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Refuser
              </Button>
              <Button
                onClick={handleValidate}
                disabled={isLoading || !smsCode || smsCode.length !== 6}
                className="flex-1"
              >
                <Check className="mr-2 h-4 w-4" />
                Valider
              </Button>
            </div>
          </div>

          {/* Note légale */}
          <div className="text-xs text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
            En validant, vous autorisez {organizationName} à déposer votre véhicule.
            Vous pouvez annuler cette autorisation à tout moment.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmsValidationModal;