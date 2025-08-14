export interface User {
  id: string;
  auth_user_id?: string;
  organisation_id?: string;
  role: string;
  full_name?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  phone?: string;
  speciality?: string;
  hire_date?: string;
  organization_name?: string;
  avatar_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  phone?: string;
  role?: string;
  speciality?: string;
  hire_date?: string;
  organization_name?: string;
  avatar_url?: string;
  auth_user_id?: string;
  organisation_id?: string;
}

export interface UserOrganization {
  id: string;
  user_id: string;
  organisation_id: string;
  organisations?: {
    id: string;
    name: string;
    slug: string;
  };
}

export const USER_ROLES = [
  { value: 'mecanicien', label: 'Mécanicien' },
  { value: 'gerant_restaurant', label: 'Gérant Restaurant' },
  { value: 'gerant_boutique', label: 'Gérant Boutique' },
  { value: 'electricien', label: 'Électricien' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'proprietaire', label: 'Propriétaire' },
  { value: 'user', label: 'Utilisateur' }
] as const;

export const USER_SPECIALITIES = [
  { value: 'mecanique_generale', label: 'Mécanique Générale' },
  { value: 'electricite_auto', label: 'Électricité Automobile' },
  { value: 'carrosserie', label: 'Carrosserie' },
  { value: 'peinture', label: 'Peinture' },
  { value: 'climatisation', label: 'Climatisation' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'restauration', label: 'Restauration' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'gestion', label: 'Gestion' },
  { value: 'autre', label: 'Autre' }
] as const;

export type UserRole = typeof USER_ROLES[number]['value'];
export type UserSpeciality = typeof USER_SPECIALITIES[number]['value']; 