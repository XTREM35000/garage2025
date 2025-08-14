export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  adresse: string;
  vehicules: string[];
  derniereVisite: string;
  totalDepense: number;
  statut: 'Actif' | 'Nouveau' | 'VIP' | 'Inactif';
  dateNaissance?: string;
  numeroPermis?: string;
  notes?: string;
  dateCreation?: string;
  dateModification?: string;
}

export interface ClientFormData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  dateNaissance: string;
  numeroPermis: string;
  statut: 'nouveau' | 'actif' | 'vip' | 'inactif';
  notes: string;
}

export const CLIENT_STATUTS = [
  { value: 'nouveau', label: 'Nouveau', color: 'text-blue-600 bg-blue-100' },
  { value: 'actif', label: 'Actif', color: 'text-green-600 bg-green-100' },
  { value: 'vip', label: 'VIP', color: 'text-purple-600 bg-purple-100' },
  { value: 'inactif', label: 'Inactif', color: 'text-gray-600 bg-gray-100' }
] as const;

export const VEHICULES_EXEMPLES = [
  'Toyota Corolla 2018',
  'Peugeot 206 2015',
  'Peugeot 206 2017',
  'Renault Logan 2019',
  'Hyundai i10 2020',
  'Dacia Sandero 2016',
  'Suzuki Swift 2021',
  'Toyota Hilux 2018',
  'Renault Clio 2019',
  'Ford Focus 2017',
  'Volkswagen Golf 2018',
  'BMW Série 3 2019',
  'Mercedes Classe C 2020',
  'Audi A3 2018',
  'Citroën C3 2019'
];

export const ADRESSES_EXEMPLES = [
  'Cocody, Abidjan',
  'Marcory, Abidjan',
  'Plateau, Abidjan',
  'Yopougon, Abidjan',
  'Adjamé, Abidjan',
  'Treichville, Abidjan',
  'Bingerville',
  'Grand-Bassam',
  'Bouaké',
  'San-Pédro',
  'Korhogo',
  'Daloa',
  'Man',
  'Gagnoa',
  'Abengourou'
];

export type ClientStatut = typeof CLIENT_STATUTS[number]['value'];
