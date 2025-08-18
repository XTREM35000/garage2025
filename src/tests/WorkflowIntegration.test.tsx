import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';
import { supabase } from '@/integrations/supabase/client';

// Mock de Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(),
      select: vi.fn(() => ({
        count: vi.fn(),
      })),
    })),
    rpc: vi.fn(),
  },
}));

// Mock de window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
  },
  writable: true,
});

describe('Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('SplashScreen s\'affiche au démarrage de l\'application', async () => {
    render(<App />);
    
    // Le SplashScreen doit être visible au début
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
    
    // Attendre que l'application soit chargée
    await waitFor(() => {
      expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('Création Super Admin avec SplashScreen', async () => {
    // Mock d'une base de données vide
    const mockSupabase = supabase as any;
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        count: vi.fn().mockResolvedValue({ count: 0, error: null }),
      })),
    });

    // Mock de la création réussie
    mockSupabase.rpc.mockResolvedValue({
      data: 'mock-user-id',
      error: null,
    });

    render(<App />);
    
    // Attendre que l'application soit chargée
    await waitFor(() => {
      expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Vérifier que le modal Super Admin s'affiche
    await waitFor(() => {
      expect(screen.getByText('Création Super Admin')).toBeInTheDocument();
    });

    // Remplir le formulaire
    const emailInput = screen.getByLabelText('Adresse email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    const nameInput = screen.getByLabelText('Nom complet');

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(nameInput, { target: { value: 'Admin Test' } });

    // Soumettre le formulaire
    const submitButton = screen.getByText('Créer Super Admin');
    fireEvent.click(submitButton);

    // Vérifier que la fonction RPC est appelée
    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_super_admin', {
        p_email: 'admin@test.com',
        p_password: 'password123',
        p_name: 'Admin Test',
      });
    });

    // Vérifier que le rechargement est appelé après succès
    await waitFor(() => {
      expect(window.location.reload).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test('Gestion d\'erreur lors de la création Super Admin', async () => {
    // Mock d'une base de données vide
    const mockSupabase = supabase as any;
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        count: vi.fn().mockResolvedValue({ count: 0, error: null }),
      })),
    });

    // Mock d'une erreur lors de la création
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'Erreur de base de données' },
    });

    render(<App />);
    
    // Attendre que l'application soit chargée
    await waitFor(() => {
      expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Vérifier que le modal Super Admin s'affiche
    await waitFor(() => {
      expect(screen.getByText('Création Super Admin')).toBeInTheDocument();
    });

    // Remplir le formulaire
    const emailInput = screen.getByLabelText('Adresse email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    const nameInput = screen.getByLabelText('Nom complet');

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(nameInput, { target: { value: 'Admin Test' } });

    // Soumettre le formulaire
    const submitButton = screen.getByText('Créer Super Admin');
    fireEvent.click(submitButton);

    // Vérifier que l'erreur s'affiche
    await waitFor(() => {
      expect(screen.getByText('Erreur de base de données')).toBeInTheDocument();
    });

    // Vérifier que le rechargement n'est PAS appelé
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  test('Workflow normal quand Super Admin existe déjà', async () => {
    // Mock d'une base de données avec un Super Admin existant
    const mockSupabase = supabase as any;
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        count: vi.fn().mockResolvedValue({ count: 1, error: null }),
      })),
    });

    render(<App />);
    
    // Attendre que l'application soit chargée
    await waitFor(() => {
      expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Vérifier que le modal Super Admin ne s'affiche PAS
    await waitFor(() => {
      expect(screen.queryByText('Création Super Admin')).not.toBeInTheDocument();
    });

    // Vérifier que l'application fonctionne normalement
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
