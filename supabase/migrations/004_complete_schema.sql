-- Migration complète pour l'application Garage Abidjan
-- Tables principales avec relations et contraintes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE: users (utilisateurs)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'employe',
    fonction VARCHAR(100),
    specialite VARCHAR(100),
    date_prise_fonction DATE,
    superior_id UUID REFERENCES users(id),
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: garages (informations garage)
-- ========================================
CREATE TABLE IF NOT EXISTS garages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    adresse TEXT NOT NULL,
    ville VARCHAR(100) NOT NULL,
    pays VARCHAR(100) DEFAULT 'Côte d\'Ivoire',
    telephone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    description TEXT,
    horaires TEXT,
    services TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: clients
-- ========================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    adresse TEXT,
    date_naissance DATE,
    numero_permis VARCHAR(50),
    statut VARCHAR(20) DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'actif', 'vip', 'inactif')),
    notes TEXT,
    total_depense DECIMAL(10,2) DEFAULT 0,
    derniere_visite TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: vehicules
-- ========================================
CREATE TABLE IF NOT EXISTS vehicules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100) NOT NULL,
    immatriculation VARCHAR(20) UNIQUE NOT NULL,
    annee VARCHAR(4) NOT NULL,
    couleur VARCHAR(50),
    carburant VARCHAR(20) CHECK (carburant IN ('Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'Autre')),
    kilometrage VARCHAR(20),
    proprietaire_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    numero_chassis VARCHAR(50),
    date_acquisition DATE,
    etat VARCHAR(20) DEFAULT 'Bon' CHECK (etat IN ('Excellent', 'Très bon', 'Bon', 'Moyen', 'Mauvais', 'Hors service')),
    notes TEXT,
    derniere_revision DATE,
    prochaine_revision DATE,
    assurance_expiration DATE,
    vignette_expiration DATE,
    controle_technique_expiration DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: reparations
-- ========================================
CREATE TABLE IF NOT EXISTS reparations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicule_id UUID REFERENCES vehicules(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    technicien_id UUID REFERENCES users(id),
    statut VARCHAR(20) DEFAULT 'En attente' CHECK (statut IN ('En attente', 'En cours', 'Terminé', 'Annulé')),
    description TEXT NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    date_debut TIMESTAMP WITH TIME ZONE NOT NULL,
    date_fin TIMESTAMP WITH TIME ZONE,
    priorite VARCHAR(20) DEFAULT 'Normale' CHECK (priorite IN ('Basse', 'Normale', 'Haute', 'Urgente')),
    notes TEXT,
    pieces_utilisees TEXT[],
    temps_estime INTEGER, -- en heures
    temps_reel INTEGER, -- en heures
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: pieces (stock)
-- ========================================
CREATE TABLE IF NOT EXISTS pieces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    reference VARCHAR(100),
    categorie VARCHAR(100),
    marque VARCHAR(100),
    modele_compatible TEXT[],
    prix_achat DECIMAL(10,2) NOT NULL,
    prix_vente DECIMAL(10,2) NOT NULL,
    quantite_stock INTEGER DEFAULT 0,
    quantite_minimum INTEGER DEFAULT 5,
    fournisseur VARCHAR(255),
    localisation VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: factures
-- ========================================
CREATE TABLE IF NOT EXISTS factures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    reparation_id UUID REFERENCES reparations(id) ON DELETE CASCADE,
    montant_ht DECIMAL(10,2) NOT NULL,
    tva DECIMAL(5,2) DEFAULT 18.5,
    montant_ttc DECIMAL(10,2) NOT NULL,
    statut VARCHAR(20) DEFAULT 'En attente' CHECK (statut IN ('En attente', 'Payée', 'Annulée')),
    date_emission DATE NOT NULL,
    date_echeance DATE,
    date_paiement DATE,
    mode_paiement VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: notifications
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: historique_actions
-- ========================================
CREATE TABLE IF NOT EXISTS historique_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES pour les performances
-- ========================================
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_telephone ON clients(telephone);
CREATE INDEX IF NOT EXISTS idx_clients_statut ON clients(statut);
CREATE INDEX IF NOT EXISTS idx_vehicules_immatriculation ON vehicules(immatriculation);
CREATE INDEX IF NOT EXISTS idx_vehicules_proprietaire ON vehicules(proprietaire_id);
CREATE INDEX IF NOT EXISTS idx_reparations_vehicule ON reparations(vehicule_id);
CREATE INDEX IF NOT EXISTS idx_reparations_client ON reparations(client_id);
CREATE INDEX IF NOT EXISTS idx_reparations_statut ON reparations(statut);
CREATE INDEX IF NOT EXISTS idx_reparations_date_debut ON reparations(date_debut);
CREATE INDEX IF NOT EXISTS idx_pieces_categorie ON pieces(categorie);
CREATE INDEX IF NOT EXISTS idx_pieces_quantite ON pieces(quantite_stock);
CREATE INDEX IF NOT EXISTS idx_factures_client ON factures(client_id);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_historique_user ON historique_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_historique_action ON historique_actions(action);

-- ========================================
-- TRIGGERS pour updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_garages_updated_at BEFORE UPDATE ON garages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicules_updated_at BEFORE UPDATE ON vehicules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reparations_updated_at BEFORE UPDATE ON reparations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pieces_updated_at BEFORE UPDATE ON pieces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_factures_updated_at BEFORE UPDATE ON factures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour calculer le total des dépenses d'un client
CREATE OR REPLACE FUNCTION update_client_total_depense()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE clients
        SET total_depense = (
            SELECT COALESCE(SUM(prix), 0)
            FROM reparations
            WHERE client_id = NEW.client_id AND statut = 'Terminé'
        )
        WHERE id = NEW.client_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE clients
        SET total_depense = (
            SELECT COALESCE(SUM(prix), 0)
            FROM reparations
            WHERE client_id = OLD.client_id AND statut = 'Terminé'
        )
        WHERE id = OLD.client_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_total_depense
    AFTER INSERT OR UPDATE OR DELETE ON reparations
    FOR EACH ROW EXECUTE FUNCTION update_client_total_depense();

-- Fonction pour mettre à jour la dernière visite d'un client
CREATE OR REPLACE FUNCTION update_client_derniere_visite()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.statut = 'Terminé' THEN
        UPDATE clients
        SET derniere_visite = NEW.date_fin
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_derniere_visite
    AFTER UPDATE ON reparations
    FOR EACH ROW EXECUTE FUNCTION update_client_derniere_visite();

-- Fonction pour générer automatiquement le numéro de facture
CREATE OR REPLACE FUNCTION generate_facture_numero()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero := 'FACT-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(CAST(nextval('facture_sequence') AS TEXT), 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Séquence pour les numéros de facture
CREATE SEQUENCE IF NOT EXISTS facture_sequence START 1;

CREATE TRIGGER trigger_generate_facture_numero
    BEFORE INSERT ON factures
    FOR EACH ROW EXECUTE FUNCTION generate_facture_numero();
