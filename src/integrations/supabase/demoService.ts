import { supabase } from './client';

export interface DemoDataResult {
  success: boolean;
  message: string;
  data?: {
    clients: number;
    vehicles: number;
    repairs: number;
    parts: number;
  };
  error?: string;
}

export interface ClearDataResult {
  success: boolean;
  message: string;
  results?: Record<string, any>;
  error?: string;
}

export class DemoService {
  /**
   * Injecte des données de démonstration dans la base de données
   */
  static async injectDemoData(): Promise<DemoDataResult> {
    try {
      const { data, error } = await supabase.functions.invoke('inject-demo-data', {
        method: 'POST',
        body: {}
      });

      if (error) {
        throw new Error(error.message);
      }

      return data as DemoDataResult;
    } catch (error) {
      console.error('Erreur injection données démo:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'injection des données',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Supprime toutes les données de démonstration
   */
  static async clearDemoData(): Promise<ClearDataResult> {
    try {
      const { data, error } = await supabase.functions.invoke('clear-demo-data', {
        method: 'POST',
        body: {}
      });

      if (error) {
        throw new Error(error.message);
      }

      return data as ClearDataResult;
    } catch (error) {
      console.error('Erreur suppression données démo:', error);
      return {
        success: false,
        message: 'Erreur lors de la suppression des données',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Vérifie si des données de démonstration existent
   */
  static async hasDemoData(): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(error.message);
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Erreur vérification données démo:', error);
      return false;
    }
  }

  /**
   * Obtient les statistiques de démonstration
   */
  static async getDemoStats() {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats');

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Erreur récupération stats démo:', error);
      return null;
    }
  }
}
