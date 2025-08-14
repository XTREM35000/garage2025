export interface Reparation {
  id: number;
  vehicule: string;
  client: string;
  statut: 'En cours' | 'Terminé' | 'En attente' | 'Annulé';
  description: string;
  prix: number;
  dateDebut: string;
  dateFin?: string;
  technicien?: string;
  priorite?: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
  notes?: string;
  piecesUtilisees?: string[];
  tempsEstime?: number; // en heures
  tempsReel?: number; // en heures
  dateCreation?: string;
  dateModification?: string;
}

export interface ReparationFormData {
  vehicule: string;
  client: string;
  statut: 'En cours' | 'Terminé' | 'En attente' | 'Annulé';
  description: string;
  prix: number;
  dateDebut: string;
  dateFin?: string;
  technicien?: string;
  priorite?: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
  notes?: string;
  piecesUtilisees?: string[];
  tempsEstime?: number;
  tempsReel?: number;
}

export const REPARATION_STATUTS = [
  { value: 'En attente', label: 'En attente', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'En cours', label: 'En cours', color: 'text-blue-600 bg-blue-100' },
  { value: 'Terminé', label: 'Terminé', color: 'text-green-600 bg-green-100' },
  { value: 'Annulé', label: 'Annulé', color: 'text-red-600 bg-red-100' }
] as const;

export const REPARATION_PRIORITES = [
  { value: 'Basse', label: 'Basse', color: 'text-gray-600 bg-gray-100' },
  { value: 'Normale', label: 'Normale', color: 'text-blue-600 bg-blue-100' },
  { value: 'Haute', label: 'Haute', color: 'text-orange-600 bg-orange-100' },
  { value: 'Urgente', label: 'Urgente', color: 'text-red-600 bg-red-100' }
] as const;

export const VEHICULES_EXEMPLES = [
  'Toyota Corolla',
  'Peugeot 206',
  'Renault Logan',
  'Hyundai i10',
  'Dacia Sandero',
  'Suzuki Swift',
  'Ford Focus',
  'Volkswagen Golf',
  'BMW Série 3',
  'Mercedes Classe C',
  'Audi A3',
  'Citroën C3',
  'Opel Corsa',
  'Fiat Punto',
  'Skoda Octavia'
];

export const CLIENTS_EXEMPLES = [
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

export const TECHNICIENS_EXEMPLES = [
  'Thierry Gogo',
  'Mamadou Diallo',
  'Kouassi Koffi',
  'Yao Yao',
  'Traoré Moussa',
  'Koné Issouf',
  'Ouattara Aminata',
  'Bamba Souleymane',
  'Coulibaly Aïcha',
  'Dosso Moussa'
];

export type ReparationStatut = typeof REPARATION_STATUTS[number]['value'];
export type ReparationPriorite = typeof REPARATION_PRIORITES[number]['value'];
