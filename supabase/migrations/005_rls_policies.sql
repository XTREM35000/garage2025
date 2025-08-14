-- Politiques RLS (Row Level Security) pour l'application Garage Abidjan

-- ========================================
-- ACTIVATION RLS SUR TOUTES LES TABLES
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reparations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique_actions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLITIQUES USERS
-- ========================================
-- Les utilisateurs peuvent voir tous les autres utilisateurs
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Seuls les admins peuvent créer/supprimer des utilisateurs
CREATE POLICY "Only admins can create users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'proprietaire')
        )
    );

CREATE POLICY "Only admins can delete users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'proprietaire')
        )
    );

-- ========================================
-- POLITIQUES GARAGES
-- ========================================
-- Tous les utilisateurs authentifiés peuvent voir les infos du garage
CREATE POLICY "Authenticated users can view garage info" ON garages
    FOR SELECT USING (auth.role() = 'authenticated');

-- Seuls les propriétaires/admins peuvent modifier les infos du garage
CREATE POLICY "Only owners can update garage info" ON garages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'proprietaire')
        )
    );

-- ========================================
-- POLITIQUES CLIENTS
-- ========================================
-- Tous les utilisateurs authentifiés peuvent voir les clients
CREATE POLICY "Authenticated users can view clients" ON clients
    FOR SELECT USING (auth.role() = 'authenticated');

-- Tous les utilisateurs authentifiés peuvent créer des clients
CREATE POLICY "Authenticated users can create clients" ON clients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Tous les utilisateurs authentifiés peuvent modifier les clients
CREATE POLICY "Authenticated users can update clients" ON clients
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Seuls les admins peuvent supprimer des clients
CREATE POLICY "Only admins can delete clients" ON clients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'proprietaire')
        )
    );

-- ========================================
-- POLITIQUES VEHICULES
-- ========================================
-- Tous les utilisateurs authentifiés peuvent voir les véhicules
CREATE POLICY "Authenticated users can view vehicles" ON vehicules
    FOR SELECT USING (auth.role() = 'authenticated');

-- Tous les utilisateurs authentifiés peuvent créer des véhicules
CREATE POLICY "Authenticated users can create vehicles" ON vehicules
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Tous les utilisateurs authentifiés peuvent modifier les véhicules
CREATE POLICY "Authenticated users can update vehicles" ON vehicules
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Seuls les admins peuvent supprimer des véhicules
CREATE POLICY "Only admins can delete vehicles" ON vehicules
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'proprietaire')
        )
    );

-- ========================================
-- POLITIQUES REPARATIONS
-- ========================================
-- Tous les utilisateurs authentifiés peuvent voir les réparations
CREATE POLICY "Authenticated users can view repairs" ON reparations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Tous les utilisateurs authentifiés peuvent créer des réparations
CREATE POLICY "Authenticated users can create repairs" ON reparations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Tous les utilisateurs authentifiés peuvent modifier les réparations
CREATE POLICY "Authenticated users can update repairs" ON reparations
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Seuls les admins peuvent supprimer des réparations
CREATE POLICY "Only admins can delete repairs" ON reparations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'proprietaire')
        )
    );

-- ========================================
-- POLITIQUES PIECES (STOCK)
-- ========================================
-- Tous les utilisateurs authentifiés peuvent voir les pièces
CREATE POLICY "Authenticated users can view parts" ON pieces
    FOR SELECT USING (auth.role() = 'authenticated');

-- Seuls les techniciens et admins peuvent créer/modifier les pièces
CREATE POLICY "Technicians and admins can manage parts" ON pieces
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'proprietaire', 'technicien')
        )
    );

-- ========================================
-- POLITIQUES FACTURES
-- ========================================
-- Tous les utilisateurs authentifiés peuvent voir les factures
CREATE POLICY "Authenticated users can view invoices" ON factures
    FOR SELECT USING (auth.role() = 'authenticated');

-- Seuls les admins et comptables peuvent créer/modifier les factures
CREATE POLICY "Admins and accountants can manage invoices" ON factures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'proprietaire', 'comptable')
        )
    );

-- ========================================
-- POLITIQUES NOTIFICATIONS
-- ========================================
-- Les utilisateurs ne peuvent voir que leurs propres notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres notifications
CREATE POLICY "Users can create own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres notifications
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- POLITIQUES HISTORIQUE ACTIONS
-- ========================================
-- Tous les utilisateurs authentifiés peuvent voir l'historique
CREATE POLICY "Authenticated users can view action history" ON historique_actions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Seuls les admins peuvent créer des entrées d'historique
CREATE POLICY "Only admins can create action history" ON historique_actions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'proprietaire')
        )
    );

-- ========================================
-- FONCTIONS RPC POUR LES ACTIONS SPÉCIALES
-- ========================================

-- Fonction pour obtenir les statistiques du dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_clients', (SELECT COUNT(*) FROM clients),
        'total_vehicules', (SELECT COUNT(*) FROM vehicules),
        'reparations_en_cours', (SELECT COUNT(*) FROM reparations WHERE statut = 'En cours'),
        'reparations_terminees', (SELECT COUNT(*) FROM reparations WHERE statut = 'Terminé'),
        'chiffre_affaires_mois', (
            SELECT COALESCE(SUM(prix), 0)
            FROM reparations
            WHERE statut = 'Terminé'
            AND date_fin >= date_trunc('month', NOW())
        ),
        'pieces_stock_faible', (
            SELECT COUNT(*)
            FROM pieces
            WHERE quantite_stock <= quantite_minimum
        )
    ) INTO stats;

    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour rechercher des clients
CREATE OR REPLACE FUNCTION search_clients(search_term TEXT)
RETURNS TABLE (
    id UUID,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(255),
    statut VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nom, c.prenom, c.telephone, c.email, c.statut
    FROM clients c
    WHERE
        c.nom ILIKE '%' || search_term || '%' OR
        c.prenom ILIKE '%' || search_term || '%' OR
        c.telephone ILIKE '%' || search_term || '%' OR
        c.email ILIKE '%' || search_term || '%'
    ORDER BY c.nom, c.prenom;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour rechercher des véhicules
CREATE OR REPLACE FUNCTION search_vehicules(search_term TEXT)
RETURNS TABLE (
    id UUID,
    marque VARCHAR(100),
    modele VARCHAR(100),
    immatriculation VARCHAR(20),
    proprietaire_nom VARCHAR(200)
) AS $$
BEGIN
    RETURN QUERY
    SELECT v.id, v.marque, v.modele, v.immatriculation,
           CONCAT(c.nom, ' ', c.prenom) as proprietaire_nom
    FROM vehicules v
    LEFT JOIN clients c ON v.proprietaire_id = c.id
    WHERE
        v.marque ILIKE '%' || search_term || '%' OR
        v.modele ILIKE '%' || search_term || '%' OR
        v.immatriculation ILIKE '%' || search_term || '%' OR
        c.nom ILIKE '%' || search_term || '%' OR
        c.prenom ILIKE '%' || search_term || '%'
    ORDER BY v.marque, v.modele;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les réparations d'un client
CREATE OR REPLACE FUNCTION get_client_repairs(client_uuid UUID)
RETURNS TABLE (
    id UUID,
    vehicule_info TEXT,
    description TEXT,
    statut VARCHAR(20),
    prix DECIMAL(10,2),
    date_debut TIMESTAMP WITH TIME ZONE,
    date_fin TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT r.id,
           CONCAT(v.marque, ' ', v.modele, ' (', v.immatriculation, ')') as vehicule_info,
           r.description, r.statut, r.prix, r.date_debut, r.date_fin
    FROM reparations r
    JOIN vehicules v ON r.vehicule_id = v.id
    WHERE r.client_id = client_uuid
    ORDER BY r.date_debut DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
