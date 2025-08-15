import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Database,
  AlertTriangle,
  Save,
  RefreshCw,
  Camera,
  Loader2
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import AdvancedSettings from '@/components/AdvancedSettings';
import { useBrainSetup } from '@/hooks/useBrainSetup';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserSettings {
  id: string;
  user_id: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_sms: boolean;
  theme: 'light' | 'dark';
  language: string;
  currency: string;
  two_factor: boolean;
  session_timeout: number;
  photo_evidence_enabled: boolean;
  min_photos: number;
  max_file_size: number;
}

const Settings: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { resetToFirstLaunch } = useBrainSetup();
  const { user: authUser, isAuthenticated } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    display: {
      theme: isDark ? 'dark' : 'light',
      language: 'fr',
      currency: 'XOF'
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30
    },
    photoEvidence: {
      enabled: true,
      minPhotos: 2,
      maxFileSize: 5
    }
  });

  // Charger les paramètres utilisateur depuis Supabase
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!authUser) return;

      try {
        setLoading(true);

        // Récupérer les paramètres depuis la table user_settings
        const { data: settingsData, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle(); // Utiliser maybeSingle au lieu de single

        if (error) {
          console.error('Erreur lors de la récupération des paramètres:', error);
          toast.error('Erreur lors du chargement des paramètres');
          return;
        }

        if (settingsData) {
          setUserSettings(settingsData);
          setSettings({
            notifications: {
              email: settingsData.notifications_email || true,
              push: settingsData.notifications_push || true,
              sms: settingsData.notifications_sms || false
            },
            display: {
              theme: settingsData.theme || (isDark ? 'dark' : 'light'),
              language: settingsData.language || 'fr',
              currency: settingsData.currency || 'XOF'
            },
            security: {
              twoFactor: settingsData.two_factor || false,
              sessionTimeout: settingsData.session_timeout || 30
            },
            photoEvidence: {
              enabled: settingsData.photo_evidence_enabled || true,
              minPhotos: settingsData.min_photos || 2,
              maxFileSize: settingsData.max_file_size || 5
            }
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        toast.error('Erreur lors du chargement des paramètres');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, [authUser, isDark]);

  const handleSaveSettings = async () => {
    if (!authUser) return;

    try {
      setSaving(true);

      // Upsert avec valeurs par défaut
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: authUser.id,
          notifications_email: settings.notifications.email || true, // Valeur par défaut
          notifications_push: settings.notifications.push || true,
          notifications_sms: settings.notifications.sms || false,
          theme: settings.display.theme || 'light',
          language: settings.display.language || 'fr',
          currency: settings.display.currency || 'XOF',
          two_factor: settings.security.twoFactor || false,
          session_timeout: settings.security.sessionTimeout || 30,
          photo_evidence_enabled: settings.photoEvidence.enabled || true,
          min_photos: settings.photoEvidence.minPhotos || 2,
          max_file_size: settings.photoEvidence.maxFileSize || 5,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast.error('Erreur lors de la sauvegarde');
        return;
      }

      // Appliquer le thème
      if (settings.display.theme === 'dark' && !isDark) {
        toggleTheme();
      } else if (settings.display.theme === 'light' && isDark) {
        toggleTheme();
      }

      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAll = () => {
    resetToFirstLaunch();
  };

  if (!isAuthenticated) {
    return (
      <div className="py-8 w-full max-w-4xl mx-auto">
        <Card className="shadow-soft animate-fade-in">
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>Vous devez être connecté pour accéder à cette page.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-8 w-full max-w-4xl mx-auto">
        <Card className="shadow-soft animate-fade-in">
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des paramètres...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="py-4 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Paramètres
            </h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Gérez votre compte et les paramètres de l'application
            </p>
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className={`grid w-full grid-cols-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
          </TabsList>

          {/* Onglet Général */}
          <TabsContent value="general" className="space-y-6">
            {/* Informations utilisateur */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isDark ? 'text-white' : ''}`}>
                  <User className="w-5 h-5" />
                  <span>Informations Utilisateur</span>
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : ''}>
                  Vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userName" className={isDark ? 'text-gray-300' : ''}>
                      Nom complet
                    </Label>
                    <Input
                      id="userName"
                      defaultValue={authUser?.user_metadata?.full_name || ''}
                      className={isDark ? 'bg-gray-700 border-gray-600' : ''}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="userEmail" className={isDark ? 'text-gray-300' : ''}>
                      Email
                    </Label>
                    <Input
                      id="userEmail"
                      type="email"
                      defaultValue={authUser?.email || ''}
                      className={isDark ? 'bg-gray-700 border-gray-600' : ''}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affichage */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isDark ? 'text-white' : ''}`}>
                  <Palette className="w-5 h-5" />
                  <span>Affichage</span>
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : ''}>
                  Personnalisez l'apparence de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className={isDark ? 'text-gray-300' : ''}>Mode sombre</Label>
                    <p className="text-sm text-gray-500">Activer le thème sombre</p>
                  </div>
                  <Switch
                    checked={isDark}
                    onCheckedChange={toggleTheme}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language" className={isDark ? 'text-gray-300' : ''}>
                      Langue
                    </Label>
                    <select
                      id="language"
                      value={settings.display.language}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        display: { ...prev.display, language: e.target.value }
                      }))}
                      className={`w-full p-2 rounded-md border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="currency" className={isDark ? 'text-gray-300' : ''}>
                      Devise
                    </Label>
                    <select
                      id="currency"
                      value={settings.display.currency}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        display: { ...prev.display, currency: e.target.value }
                      }))}
                      className={`w-full p-2 rounded-md border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="XOF">XOF (FCFA)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preuves Photo */}
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isDark ? 'text-white' : ''}`}>
                  <Camera className="w-5 h-5" />
                  <span>Preuves Photo</span>
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : ''}>
                  Configuration de la documentation photo obligatoire
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className={isDark ? 'text-gray-300' : ''}>Activer les preuves photo</Label>
                    <p className="text-sm text-gray-500">Documentation obligatoire pour certaines réparations</p>
                  </div>
                  <Switch
                    checked={settings.photoEvidence.enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      photoEvidence: { ...prev.photoEvidence, enabled: checked }
                    }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPhotos" className={isDark ? 'text-gray-300' : ''}>
                      Nombre minimum de photos
                    </Label>
                    <Input
                      id="minPhotos"
                      type="number"
                      min="1"
                      max="5"
                      value={settings.photoEvidence.minPhotos}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        photoEvidence: { ...prev.photoEvidence, minPhotos: parseInt(e.target.value) }
                      }))}
                      className={isDark ? 'bg-gray-700 border-gray-600' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxFileSize" className={isDark ? 'text-gray-300' : ''}>
                      Taille max. par photo (MB)
                    </Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.photoEvidence.maxFileSize}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        photoEvidence: { ...prev.photoEvidence, maxFileSize: parseInt(e.target.value) }
                      }))}
                      className={isDark ? 'bg-gray-700 border-gray-600' : ''}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📸 Conditions d'activation</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Durée de réparation {'>'} 24 heures</li>
                    <li>• Type : Carrosserie ou Moteur</li>
                    <li>• Valeur du véhicule {'>'} 5M FCFA</li>
                    <li>• Client non blacklisté</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isDark ? 'text-white' : ''}`}>
                  <Bell className="w-5 h-5" />
                  <span>Préférences de Notifications</span>
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : ''}>
                  Choisissez comment recevoir vos notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className={isDark ? 'text-gray-300' : ''}>Notifications par email</Label>
                      <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className={isDark ? 'text-gray-300' : ''}>Notifications push</Label>
                      <p className="text-sm text-gray-500">Notifications dans le navigateur</p>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, push: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className={isDark ? 'text-gray-300' : ''}>Notifications SMS</Label>
                      <p className="text-sm text-gray-500">Recevoir les notifications par SMS</p>
                    </div>
                    <Switch
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, sms: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={`flex items-center space-x-2 ${isDark ? 'text-white' : ''}`}>
                  <Shield className="w-5 h-5" />
                  <span>Sécurité</span>
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : ''}>
                  Paramètres de sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className={isDark ? 'text-gray-300' : ''}>Authentification à deux facteurs</Label>
                      <p className="text-sm text-gray-500">Sécurisez votre compte avec 2FA</p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactor}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, twoFactor: checked }
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout" className={isDark ? 'text-gray-300' : ''}>
                      Timeout de session (minutes)
                    </Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="5"
                      max="480"
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                        }))
                      }
                      className={isDark ? 'bg-gray-700 border-gray-600' : ''}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Durée d'inactivité avant déconnexion automatique
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Avancé */}
          <TabsContent value="advanced">
            <AdvancedSettings onDeleteAll={handleDeleteAll} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
