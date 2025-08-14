export interface Vehicle {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
  annee: string;
  couleur: string;
  carburant: string;
  kilometrage: string;
  proprietaire: string;
  numeroChassis: string;
  dateAcquisition: string;
  etat: string;
  notes: string;
  dateCreation?: string;
  dateModification?: string;
  derniereRevision?: string;
  prochaineRevision?: string;
  assurance?: string;
  vignette?: string;
  controleTechnique?: string;
}

export interface VehicleFormData {
  marque: string;
  modele: string;
  immatriculation: string;
  annee: string;
  couleur: string;
  carburant: string;
  kilometrage: string;
  proprietaire: string;
  numeroChassis: string;
  dateAcquisition: string;
  etat: string;
  notes: string;
}

export const VEHICLE_CARBURANTS = [
  { value: 'Essence', label: 'Essence', color: 'text-red-600 bg-red-100' },
  { value: 'Diesel', label: 'Diesel', color: 'text-blue-600 bg-blue-100' },
  { value: 'Hybride', label: 'Hybride', color: 'text-green-600 bg-green-100' },
  { value: 'Électrique', label: 'Électrique', color: 'text-purple-600 bg-purple-100' },
  { value: 'GPL', label: 'GPL', color: 'text-orange-600 bg-orange-100' },
  { value: 'Autre', label: 'Autre', color: 'text-gray-600 bg-gray-100' }
] as const;

export const VEHICLE_ETATS = [
  { value: 'Excellent', label: 'Excellent', color: 'text-green-600 bg-green-100' },
  { value: 'Très bon', label: 'Très bon', color: 'text-blue-600 bg-blue-100' },
  { value: 'Bon', label: 'Bon', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'Moyen', label: 'Moyen', color: 'text-orange-600 bg-orange-100' },
  { value: 'Mauvais', label: 'Mauvais', color: 'text-red-600 bg-red-100' },
  { value: 'Hors service', label: 'Hors service', color: 'text-gray-600 bg-gray-100' }
] as const;

export const VEHICLE_MARQUES = [
  'Peugeot',
  'Renault',
  'Toyota',
  'Hyundai',
  'Dacia',
  'Suzuki',
  'Ford',
  'Volkswagen',
  'BMW',
  'Mercedes',
  'Audi',
  'Citroën',
  'Opel',
  'Fiat',
  'Skoda',
  'Nissan',
  'Honda',
  'Mazda',
  'Kia',
  'Chevrolet'
];

export const VEHICLE_COULEURS = [
  'Blanc',
  'Noir',
  'Gris',
  'Rouge',
  'Bleu',
  'Vert',
  'Jaune',
  'Orange',
  'Marron',
  'Beige',
  'Argent',
  'Or',
  'Rose',
  'Violet',
  'Multicolore'
];

export const PROPRIETAIRES_EXEMPLES = [
  'Kouassi Jean',
  'Diabaté Fatou',
  'Traoré Ali',
  'Yao Marie',
  'Koné Issouf',
  'Ouattara Aminata',
  'Bamba Souleymane',
  'Coulibaly Aïcha',
  'Dosso Moussa',
  'Fofana Mariam',
  'Guei Pierre',
  'Kouamé Lucie',
  'N\'Guessan Paul',
  'Sanogo Fatim',
  'Zabré Issa'
];

export type VehicleCarburant = typeof VEHICLE_CARBURANTS[number]['value'];
export type VehicleEtat = typeof VEHICLE_ETATS[number]['value'];
