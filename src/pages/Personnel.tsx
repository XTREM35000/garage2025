import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  Calendar,
  GraduationCap,
  Loader2,
  Search,
  Filter,
  UserPlus,
  Camera,
  Crown,
  Shield
} from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { supabase } from '@/integrations/supabase/client';
import { FileService } from '@/integrations/supabase/fileService';
import { User, UserProfile } from '@/types/users';

interface PersonnelMember extends User {
  // Interface étendue pour la compatibilité
}

const Personnel: React.FC = () => {
  const { user: authUser, isAuthenticated } = useSimpleAuth();
  const [personnel, setPersonnel] = useState<PersonnelMember[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<PersonnelMember | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    speciality: '',
    hire_date: '',
    organization_name: ''
  });

  const roles = [
    { value: 'mecanicien', label: 'Mécanicien' },
    { value: 'gerant_restaurant', label: 'Gérant Restaurant' },
    { value: 'gerant_boutique', label: 'Gérant Boutique' },
    { value: 'electricien', label: 'Électricien' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'proprietaire', label: 'Propriétaire' }
  ];

  const specialities = [
    { value: 'mecanique_generale', label: 'Mécanique Générale' },
    { value: 'electricite_auto', label: 'Électricité Automobile' },
    { value: 'carrosserie', label: 'Carrosserie' },
    { value: 'peinture', label: 'Peinture' },
    { value: 'climatisation', label: 'Climatisation' },
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'restauration', label: 'Restauration' },
    { value: 'commerce', label: 'Commerce' }
  ];

  // Vérifier si l'utilisateur est admin
  const isAdmin = authUser?.user_metadata?.role === 'admin' || authUser?.user_metadata?.role === 'super_admin' || authUser?.user_metadata?.role === 'proprietaire';

  // Charger la liste du personnel et l'utilisateur connecté
  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
      if (isAdmin) {
        fetchPersonnel();
      }
    }
  }, [isAuthenticated, isAdmin]);

  const fetchCurrentUser = async () => {
    try {
      if (!authUser) return;

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return;
      }

      setCurrentUser(userData);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
    }
  };

  const fetchPersonnel = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération du personnel:', error);
        toast.error('Erreur lors du chargement du personnel');
        return;
      }

      setPersonnel(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement du personnel:', error);
      toast.error('Erreur lors du chargement du personnel');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: '',
      speciality: '',
      hire_date: '',
      organization_name: ''
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditingMember(null);
  };

  const handleEdit = (member: PersonnelMember) => {
    setEditingMember(member);
    setFormData({
      full_name: member.full_name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || '',
      speciality: member.speciality || '',
      hire_date: member.hire_date || '',
      organization_name: member.organization_name || ''
    });
    setAvatarPreview(member.avatar_url || null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.email || !formData.role) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      setSaving(true);
      let avatarUrl = editingMember?.avatar_url;

      // Upload de l'avatar si un nouveau fichier est sélectionné
      if (avatarFile) {
        try {
          avatarUrl = await FileService.uploadUserAvatar(
            avatarFile,
            editingMember?.auth_user_id || 'default-user'
          );
        } catch (uploadError) {
          console.error('Erreur upload avatar:', uploadError);
          toast.error('Erreur lors de l\'upload de l\'avatar: ' + (uploadError as Error).message);
          return;
        }
      }

      const memberData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        speciality: formData.speciality,
        hire_date: formData.hire_date || null,
        organization_name: formData.organization_name,
        avatar_url: avatarUrl
      };

      if (editingMember) {
        // Mise à jour
        const { error } = await supabase
          .from('users')
          .update(memberData)
          .eq('id', editingMember.id);

        if (error) {
          console.error('Erreur lors de la mise à jour:', error);
          toast.error('Erreur lors de la mise à jour');
          return;
        }

        toast.success('Membre du personnel mis à jour avec succès');
      } else {
        // Création - Note: Pour créer un nouvel utilisateur, il faudrait d'abord créer le compte auth
        toast.info('Fonctionnalité de création en cours de développement');
        return;
      }

      setIsModalOpen(false);
      resetForm();
      fetchPersonnel();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: PersonnelMember) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre du personnel ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', member.id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
        return;
      }

      toast.success('Membre du personnel supprimé avec succès');
      fetchPersonnel();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getRoleLabel = (roleValue: string) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const getSpecialityLabel = (specialityValue: string) => {
    const speciality = specialities.find(s => s.value === specialityValue);
    return speciality ? speciality.label : specialityValue;
  };

  const getRoleColor = (roleValue: string) => {
    switch (roleValue) {
      case 'proprietaire':
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'gerant_restaurant':
      case 'gerant_boutique':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-8 w-full max-w-6xl mx-auto px-4">
        <Alert>
          <AlertDescription>Vous devez être connecté pour accéder à cette page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Combiner l'utilisateur connecté avec le personnel pour l'affichage
  const allPersonnel = currentUser
    ? [currentUser as PersonnelMember, ...personnel.filter(p => p.id !== currentUser.id)]
    : personnel;

  // Filtrage du personnel
  const filteredPersonnel = allPersonnel.filter(member => {
    const matchesSearch = !searchTerm ||
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.prenom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || member.role === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="py-4 w-full max-w-7xl mx-auto px-4">
      <div className="space-y-4">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-8 w-8 text-green-600" />
              Gestion du Personnel
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les membres de votre équipe
            </p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un membre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? 'Modifier' : 'Ajouter'} un membre du personnel
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Upload avatar */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-green-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-sm text-gray-500">Cliquez pour changer l'avatar</p>
                </div>

                {/* Informations personnelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nom complet *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Nom complet"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle *</Label>
                    <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="speciality">Spécialité</Label>
                    <Select value={formData.speciality} onValueChange={(value) => handleSelectChange('speciality', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une spécialité" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialities.map(speciality => (
                          <SelectItem key={speciality.value} value={speciality.value}>
                            {speciality.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hire_date">Date d'embauche</Label>
                    <Input
                      id="hire_date"
                      name="hire_date"
                      type="date"
                      value={formData.hire_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization_name">Organisation</Label>
                  <Input
                    id="organization_name"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleInputChange}
                    placeholder="Nom de l'organisation"
                  />
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      'Sauvegarder'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau du personnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Liste du Personnel ({filteredPersonnel.length})</span>
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Chargement...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membre</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Embauche</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPersonnel.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Aucun membre du personnel trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPersonnel.map((member) => {
                      const isCurrentUser = member.id === currentUser?.id;
                      const displayName = member.full_name || `${member.nom || ''} ${member.prenom || ''}`.trim() || 'Sans nom';

                      return (
                        <TableRow key={member.id} className={isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {member.avatar_url ? (
                                <img
                                  src={member.avatar_url}
                                  alt={displayName}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {displayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="font-medium flex items-center gap-2">
                                    {displayName}
                                    {isCurrentUser && (
                                      <Crown className="h-4 w-4 text-yellow-500" />
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-500">{member.organization_name}</p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {member.email && (
                                <div className="flex items-center text-sm">
                                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                  {member.email}
                                </div>
                              )}
                              {member.phone && (
                                <div className="flex items-center text-sm">
                                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                  {member.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(member.role || '')}>
                              {getRoleLabel(member.role || '')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                              {member.speciality ? getSpecialityLabel(member.speciality) : 'Non définie'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {member.hire_date ? new Date(member.hire_date).toLocaleDateString('fr-FR') : 'Non définie'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(member)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(member)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Personnel;
