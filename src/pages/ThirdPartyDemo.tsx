import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Car,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Eye
} from 'lucide-react';
import ThirdPartyForm, { ThirdPartyData } from '@/components/ThirdPartyForm';
import SmsValidationModal from '@/components/SmsValidationModal';
import { useThirdPartyAuth, ThirdPartyAuthorization } from '@/hooks/useThirdPartyAuth';

const ThirdPartyDemo: React.FC = () => {
  const [showThirdPartyForm, setShowThirdPartyForm] = useState(false);
  const [showSmsValidation, setShowSmsValidation] = useState(false);
  const [currentAuth, setCurrentAuth] = useState<ThirdPartyAuthorization | null>(null);

  const {
    authorizations,
    isLoading,
    createAuthorization,
    validateAuthorization,
    rejectAuthorization,
    getPendingAuthorizations,
    getValidatedAuthorizations
  } = useThirdPartyAuth();

  const handleThirdPartySubmit = async (data: ThirdPartyData) => {
    try {
      const newAuth = await createAuthorization(data);
      setCurrentAuth(newAuth);
      setShowSmsValidation(true);
      console.log('Nouvelle autorisation créée:', newAuth);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleSmsValidate = async (code: string) => {
    if (!currentAuth) return;

    try {
      const isValid = await validateAuthorization(currentAuth.id, code);
      if (isValid) {
        console.log('Autorisation validée avec succès!');
        setShowSmsValidation(false);
        setCurrentAuth(null);
      } else {
        console.log('Code invalide ou autorisation expirée');
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const handleSmsReject = async () => {
    if (!currentAuth) return;

    try {
      await rejectAuthorization(currentAuth.id);
      console.log('Autorisation rejetée');
      setShowSmsValidation(false);
      setCurrentAuth(null);
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">En attente</Badge>;
      case 'validated':
        return <Badge className="bg-green-100 text-green-800">Validée</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-gray-600 border-gray-200">Expirée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const pendingAuthorizations = getPendingAuthorizations();
  const validatedAuthorizations = getValidatedAuthorizations();

  return (
    <div>
      <div className="py-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion des Tiers</h1>
            <p className="text-gray-600">
              Système de validation pour les dépôts de véhicules par des tiers
            </p>
          </div>
          <Button
            onClick={() => setShowThirdPartyForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Demande Tiers
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{authorizations.length}</p>
                </div>
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingAuthorizations.length}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Validées</p>
                  <p className="text-2xl font-bold text-green-600">{validatedAuthorizations.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejetées</p>
                  <p className="text-2xl font-bold text-red-600">
                    {authorizations.filter(a => a.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Autorisations en attente */}
        {pendingAuthorizations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Autorisations en Attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingAuthorizations.map((auth) => (
                  <div key={auth.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{auth.thirdPartyName}</h3>
                        <p className="text-gray-600">{auth.thirdPartyPhone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(auth.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCurrentAuth(auth);
                            setShowSmsValidation(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Valider
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-500" />
                        <span>{auth.vehicleInfo.marque} {auth.vehicleInfo.modele}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <Badge variant="outline">{auth.vehicleInfo.immatriculation}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>Expire: {formatDate(auth.expiresAt)}</span>
                      </div>
                    </div>

                    {auth.restrictions && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>Restrictions :</strong> {auth.restrictions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Autorisations validées */}
        {validatedAuthorizations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Autorisations Validées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validatedAuthorizations.map((auth) => (
                  <div key={auth.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{auth.thirdPartyName}</h3>
                        <p className="text-gray-600">{auth.thirdPartyPhone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(auth.status)}
                        {auth.validatedAt && (
                          <span className="text-sm text-gray-500">
                            Validée le {formatDate(auth.validatedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-500" />
                        <span>{auth.vehicleInfo.marque} {auth.vehicleInfo.modele}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <Badge variant="outline">{auth.vehicleInfo.immatriculation}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Autorisé</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message si aucune autorisation */}
        {authorizations.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune autorisation</h3>
              <p className="text-gray-600 mb-4">
                Commencez par créer une nouvelle demande de dépôt par tiers.
              </p>
              <Button
                onClick={() => setShowThirdPartyForm(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer une demande
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Informations de test */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Mode Démo :</strong> Pour tester la validation SMS, utilisez le code <code className="bg-blue-100 px-1 rounded">123456</code>.
            Les SMS sont simulés dans la console du navigateur.
          </AlertDescription>
        </Alert>

        {/* Modals */}
        <ThirdPartyForm
          isOpen={showThirdPartyForm}
          onClose={() => setShowThirdPartyForm(false)}
          onSubmit={handleThirdPartySubmit}
        />

        {currentAuth && (
          <SmsValidationModal
            isOpen={showSmsValidation}
            onComplete={() => {
              setShowSmsValidation(false);
              setCurrentAuth(null);
            }}
            organizationName={currentAuth.thirdPartyName}
            adminName="Tiers"
          />
        )}
      </div>
    </div>
  );
};

export default ThirdPartyDemo;
