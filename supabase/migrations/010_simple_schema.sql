-- Migration simplifiée utilisant Supabase Auth
-- Pas de table users séparée, utilisation de auth.users

-- Activation des extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE: garages
-- ========================================
CREATE TABLE IF NOT EXISTS garages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    adresse TEXT NOT NULL,
    ville VARCHAR(100) NOT NULL,
    pays VARCHAR(100) DEFAULT 'Côte d''Ivoire',
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    logo_url TEXT,
    description TEXT,
    horaires JSONB,
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
    total_depense DECIMAL(12,2) DEFAULT 0,
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
    annee INTEGER NOT NULL CHECK (annee BETWEEN 1900 AND EXTRACT(YEAR FROM NOW()) + 1),
    couleur VARCHAR(50),
    carburant VARCHAR(20) NOT NULL CHECK (carburant IN ('Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'Autre')),
    kilometrage INTEGER DEFAULT 0 CHECK (kilometrage >= 0),
    proprietaire_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    numero_chassis VARCHAR(50) UNIQUE,
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
    vehicule_id UUID NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    technicien_id UUID REFERENCES auth.users(id),
    statut VARCHAR(20) DEFAULT 'En attente' CHECK (statut IN ('En attente', 'En cours', 'Terminé', 'Annulé', 'Facturé')),
    description TEXT NOT NULL,
    prix DECIMAL(12,2) NOT NULL CHECK (prix >= 0),
    date_debut TIMESTAMP WITH TIME ZONE NOT NULL,
    date_fin TIMESTAMP WITH TIME ZONE,
    priorite VARCHAR(20) DEFAULT 'Normale' CHECK (priorite IN ('Basse', 'Normale', 'Haute', 'Urgente')),
    notes TEXT,
    pieces_utilisees JSONB,
    temps_estime INTEGER CHECK (temps_estime > 0),
    temps_reel INTEGER CHECK (temps_reel > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: pieces
-- ========================================
CREATE TABLE IF NOT EXISTS pieces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    categorie VARCHAR(100) NOT NULL,
    marque VARCHAR(100),
    modeles_compatibles JSONB,
    prix_achat DECIMAL(10,2) NOT NULL CHECK (prix_achat >= 0),
    prix_vente DECIMAL(10,2) NOT NULL CHECK (prix_vente >= 0),
    quantite_stock INTEGER DEFAULT 0 CHECK (quantite_stock >= 0),
    quantite_minimum INTEGER DEFAULT 5 CHECK (quantite_minimum >= 0),
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
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    reparation_id UUID NOT NULL REFERENCES reparations(id) ON DELETE CASCADE,
    montant_ht DECIMAL(12,2) NOT NULL CHECK (montant_ht >= 0),
    tva DECIMAL(5,2) DEFAULT 18.5 CHECK (tva >= 0),
    montant_ttc DECIMAL(12,2) NOT NULL CHECK (montant_ttc >= 0),
    statut VARCHAR(20) DEFAULT 'En attente' CHECK (statut IN ('En attente', 'Payée', 'Annulée', 'En retard')),
    date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
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
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: historique_actions
-- ========================================
CREATE TABLE IF NOT EXISTS historique_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_clients_nom_prenom ON clients(nom, prenom);
CREATE INDEX IF NOT EXISTS idx_clients_telephone ON clients(telephone);
CREATE INDEX IF NOT EXISTS idx_clients_statut ON clients(statut);
CREATE INDEX IF NOT EXISTS idx_vehicules_immatriculation ON vehicules(immatriculation);
CREATE INDEX IF NOT EXISTS idx_vehicules_marque_modele ON vehicules(marque, modele);
CREATE INDEX IF NOT EXISTS idx_vehicules_proprietaire ON vehicules(proprietaire_id);
CREATE INDEX IF NOT EXISTS idx_reparations_dates ON reparations(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_reparations_statut ON reparations(statut);
CREATE INDEX IF NOT EXISTS idx_reparations_technicien ON reparations(technicien_id);
CREATE INDEX IF NOT EXISTS idx_pieces_reference ON pieces(reference);
CREATE INDEX IF NOT EXISTS idx_pieces_categorie ON pieces(categorie);
CREATE INDEX IF NOT EXISTS idx_factures_numero ON factures(numero);
CREATE INDEX IF NOT EXISTS idx_factures_dates ON factures(date_emission, date_echeance);

-- ========================================
-- TRIGGERS
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_garages_updated BEFORE UPDATE ON garages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vehicules_updated BEFORE UPDATE ON vehicules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reparations_updated BEFORE UPDATE ON reparations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pieces_updated BEFORE UPDATE ON pieces FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_factures_updated BEFORE UPDATE ON factures FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- SÉQUENCES ET FONCTIONS
-- ========================================
CREATE SEQUENCE IF NOT EXISTS facture_seq START 1000;

CREATE OR REPLACE FUNCTION generate_facture_numero()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero := 'FACT-' || TO_CHAR(NEW.date_emission, 'YYYYMM') || '-' || LPAD(NEXTVAL('facture_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_facture_numero
BEFORE INSERT ON factures
FOR EACH ROW EXECUTE FUNCTION generate_facture_numero();
