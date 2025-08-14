export interface StockItem {
  id: number;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  seuilAlerte: number;
  categorie: string;
  fournisseur: string;
  description?: string;
  codeProduit?: string;
  dateAjout?: string;
  dateModification?: string;
}

export interface StockFormData {
  nom: string;
  quantite: number;
  prixUnitaire: number;
  seuilAlerte: number;
  categorie: string;
  fournisseur: string;
  description: string;
  codeProduit: string;
}

export const STOCK_CATEGORIES = [
  'Filtres',
  'Freinage',
  'Électricité',
  'Lubrifiants',
  'Moteur',
  'Refroidissement',
  'Suspension',
  'Transmission',
  'Carrosserie',
  'Éclairage',
  'Climatisation',
  'Autres'
] as const;

export const STOCK_FOURNISSEURS = [
  'Total Côte d\'Ivoire',
  'Brembo Distribution',
  'Exide Technologies',
  'NGK Spark Plugs',
  'Mann Filter',
  'Gates Corporation',
  'Bosch',
  'Continental',
  'Michelin',
  'Castrol',
  'Mobil',
  'Autres'
] as const;

export type StockCategory = typeof STOCK_CATEGORIES[number];
export type StockFournisseur = typeof STOCK_FOURNISSEURS[number];
