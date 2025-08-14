import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Users,
  Edit,
  Save,
  X,
  Upload,
  Camera,
  Shield,
  Clock,
  Star,
  Loader2
} from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { supabase } from '@/integrations/supabase/client';
import { FileService } from '@/lib/fileService';

interface UserProfile {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  role?: string;
  fonction?: string;
  specialite?: string;
  date_prise_fonction?: string;
  photo_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

const Profil: React.FC = () => {
  const { user: authUser, isAuthenticated } = useSimpleAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    speciality: '',
    date_prise_fonction: '',
    organization_name: ''
  });

  const roles = [
    { value: 'mecanicien', label: 'Mécanicien' },
    { value: 'gerant_restaurant', label: 'Gérant Restaurant' },
    { value: 'gerant_boutique', label: 'Gérant Boutique' },
    { value: 'electricien', label: 'Électricien' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' }
  ];

  const specialities = [
    { value: 'mecanique-generale', label: 'Mécanique Générale' },
    { value: 'mecanique-moteur', label: 'Mécanique Moteur' },
    { value: 'electricite-automobile', label: 'Électricité Automobile' },
    { value: 'electronique', label: 'Électronique' },
    { value: 'climatisation', label: 'Climatisation' },
    { value: 'carrosserie', label: 'Carrosserie' },
    { value: 'peinture', label: 'Peinture' },
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'informatique', label: 'Informatique' },
    { value: 'administration', label: 'Administration' },
    { value: 'comptabilite', label: 'Comptabilité' },
    { value: 'vente', label: 'Vente' },
    { value: 'accueil', label: 'Accueil' },
    { value: 'gestion', label: 'Gestion' }
  ];

  // Charger les données utilisateur depuis Supabase
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser) return;

      try {
        setLoading(true);

        // Récupérer le profil depuis la table users
        const { data: profileData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error('Erreur lors de la récupération du profil:', error);

          // Si l'utilisateur n'existe pas dans la table users, créer un profil par défaut
          if (error.code === 'PGRST116') {
            console.log('Utilisateur non trouvé dans la table users, création d\'un profil par défaut');

            // Créer un profil par défaut basé sur les métadonnées auth
            const defaultProfile: UserProfile = {
              id: authUser.id,
              email: authUser.email || '',
              nom: authUser.user_metadata?.full_name?.split(' ')[0] || '',
              prenom: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
              telephone: '',
              role: 'employe',
              fonction: '',
              specialite: '',
              date_prise_fonction: '',
              photo_url: authUser.user_metadata?.avatar_url || '',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            setUserProfile(defaultProfile);
            setFormData({
              full_name: authUser.user_metadata?.full_name || authUser.email || '',
              email: authUser.email || '',
              phone: '',
              role: 'employe',
              speciality: '',
              date_prise_fonction: '',
              organization_name: ''
            });

            // L'avatar sera récupéré depuis les métadonnées utilisateur
            if (authUser?.user_metadata?.avatar_url) {
              setAvatarPreview(authUser.user_metadata.avatar_url);
            }
          } else {
            // Pour les autres erreurs, afficher un message d'erreur
            toast.error('Erreur lors du chargement du profil');
          }
          return;
        }

        if (profileData) {
          setUserProfile(profileData);
          setFormData({
            full_name: `${profileData.nom || ''} ${profileData.prenom || ''}`.trim(),
            email: profileData.email || authUser.email || '',
            phone: profileData.telephone || '',
            role: profileData.role || '',
            speciality: profileData.specialite || '',
            date_prise_fonction: profileData.date_prise_fonction || '',
            organization_name: profileData.fonction || ''
          });

          // L'avatar sera récupéré depuis les métadonnées utilisateur
          if (authUser?.user_metadata?.avatar_url) {
            setAvatarPreview(authUser.user_metadata.avatar_url);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('L\'image est trop volumineuse (max 2Mo)');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!authUser) return;

    try {
      setSaving(true);
      console.log('Début de la sauvegarde...');

      // 1. Upload de l'avatar d'abord
      let avatarUrl = authUser?.user_metadata?.avatar_url;
      if (avatarFile) {
        try {
          console.log('Upload de l\'avatar...');
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(`user_${authUser.id}/avatar`, avatarFile, {
              upsert: true
            });

          if (uploadError) throw uploadError;

          if (uploadData?.path) {
            avatarUrl = supabase.storage
              .from('avatars')
              .getPublicUrl(uploadData.path).data.publicUrl;
          }
        } catch (error) {
          console.error('Erreur upload avatar:', error);
          toast.error('Erreur lors de l\'upload de l\'avatar');
          return;
        }
      }

      // 2. Mise à jour des métadonnées auth
      console.log('Mise à jour auth metadata...');
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl,
          full_name: formData.full_name,
          updated_at: new Date().toISOString()
        }
      });

      if (userUpdateError) throw userUpdateError;

      // 3. Mise à jour ou création dans public.users
      console.log('Mise à jour profil utilisateur...');
      const userData = {
        id: authUser.id,
        email: formData.email,
        nom: formData.full_name.split(' ')[0],
        prenom: formData.full_name.split(' ').slice(1).join(' '),
        telephone: formData.phone,
        role: formData.role,
        specialite: formData.speciality,
        date_prise_fonction: formData.date_prise_fonction,
        fonction: formData.organization_name,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('users')
        .upsert(userData, {
          onConflict: 'id'
        });

      if (upsertError) throw upsertError;

      // 4. Recharger les données
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (fetchError) throw fetchError;

      setUserProfile(updatedProfile);
      setAvatarPreview(avatarUrl);
      setIsEditing(false);
      setAvatarFile(null);
      toast.success('Profil mis à jour avec succès');

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);

    // Restaurer les données originales
    if (userProfile) {
      setFormData({
        full_name: `${userProfile.nom || ''} ${userProfile.prenom || ''}`.trim(),
        email: userProfile.email || authUser?.email || '',
        phone: userProfile.telephone || '',
        role: userProfile.role || '',
        speciality: userProfile.specialite || '',
        date_prise_fonction: userProfile.date_prise_fonction || '',
        organization_name: userProfile.fonction || ''
      });
      setAvatarPreview(authUser?.user_metadata?.avatar_url || null);
    }
  };

  const getRoleColor = (roleValue: string) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (roleValue: string) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const getSpecialityLabel = (specialityValue: string) => {
    const speciality = specialities.find(s => s.value === specialityValue);
    return speciality ? speciality.label : specialityValue;
  };

  if (!isAuthenticated) {
    return (
      <div className="py-8 w-full max-w-4xl mx-auto">
        <Card className="shadow-soft animate-fade-in">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
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
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement du profil...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="py-4 w-full max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte de profil principale */}
          <div className="lg:col-span-1">
            <Card className="shadow-soft animate-fade-in">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-2">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover object-center border-4 border-green-200 shadow-lg"
                      style={{ objectPosition: 'center top' }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center border-4 border-green-200 shadow-lg">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  {isEditing && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors shadow-lg"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </label>
                  )}
                  {isEditing && (
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  )}
                </div>
                <CardTitle className="text-2xl font-bold">
                  {userProfile ? `${userProfile.nom || ''} ${userProfile.prenom || ''}`.trim() || authUser?.email : authUser?.email || 'Utilisateur'}
                </CardTitle>
                <div className="flex justify-center mb-2">
                  <Badge className={getRoleColor(userProfile?.role || '')}>
                    {getRoleLabel(userProfile?.role || '')}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{userProfile?.specialite ? getSpecialityLabel(userProfile.specialite) : 'Spécialité non définie'}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">{userProfile?.email || authUser?.email}</span>
                </div>
                {userProfile?.telephone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">{userProfile.telephone}</span>
                  </div>
                )}
                {userProfile?.fonction && (
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">{userProfile.fonction}</span>
                  </div>
                )}
                <div className="flex justify-center pt-4">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Sauvegarder
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="w-4 h-4 mr-2" />Annuler
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />Modifier le profil
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informations détaillées */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <Card className="shadow-soft animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Informations personnelles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Nom complet</Label>
                    {isEditing ? (
                      <Input
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="h-10"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{userProfile ? `${userProfile.nom || ''} ${userProfile.prenom || ''}`.trim() : 'Non renseigné'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    {isEditing ? (
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-10"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{userProfile?.email || authUser?.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Téléphone</Label>
                    {isEditing ? (
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="h-10"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{userProfile?.telephone || 'Non renseigné'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations professionnelles */}
            <Card className="shadow-soft animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Informations professionnelles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Rôle</Label>
                    {isEditing ? (
                      <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Sélectionnez votre rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleColor(userProfile?.role || '')}>
                          {getRoleLabel(userProfile?.role || '')}
                        </Badge>
                      </div>
                    )}
                  </div>

                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Domaine de spécialité</Label>
                    {isEditing ? (
                      <Select value={formData.speciality} onValueChange={(value) => handleSelectChange('speciality', value)}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Sélectionnez votre spécialité" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialities.map(speciality => (
                            <SelectItem key={speciality.value} value={speciality.value}>{speciality.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.specialite ? getSpecialityLabel(userProfile.specialite) : 'Non renseigné'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date de prise de fonction</Label>
                    {isEditing ? (
                      <Input
                        name="date_prise_fonction"
                        type="date"
                        value={formData.date_prise_fonction}
                        onChange={handleInputChange}
                        className="h-10"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.date_prise_fonction ? new Date(userProfile.date_prise_fonction).toLocaleDateString('fr-FR') : 'Non renseigné'}
                      </p>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Informations de l'organisation */}
            <Card className="shadow-soft animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Informations de l'organisation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nom de l'organisation</Label>
                  {isEditing ? (
                    <Input
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleInputChange}
                      className="h-10"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{userProfile?.fonction || 'Non renseigné'}</p>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card className="shadow-soft animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Statistiques</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Clients</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Véhicules</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-600">Réparations</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-600">Pièces</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;