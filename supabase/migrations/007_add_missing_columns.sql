-- Migration pour ajouter les colonnes manquantes sans supprimer les tables existantes
-- Version sûre qui préserve les données existantes

-- ========================================
-- VÉRIFICATION ET AJOUT DES COLONNES MANQUANTES
-- ========================================

-- Fonction pour ajouter une colonne si elle n'existe pas
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    table_name TEXT,
    column_name TEXT,
    column_definition TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = $1 AND column_name = $2
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', table_name, column_name, column_definition);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TABLE: users (ajout de colonnes manquantes)
-- ========================================
SELECT add_column_if_not_exists('users', 'role', 'VARCHAR(50) DEFAULT ''employe'' CHECK (role IN (''admin'', ''manager'', ''technicien'', ''employe''))');
SELECT add_column_if_not_exists('users', 'fonction', 'VARCHAR(100)');
SELECT add_column_if_not_exists('users', 'specialite', 'VARCHAR(100)');
SELECT add_column_if_not_exists('users', 'date_prise_fonction', 'DATE');
SELECT add_column_if_not_exists('users', 'superior_id', 'UUID REFERENCES users(id)');
SELECT add_column_if_not_exists('users', 'photo_url', 'TEXT');
SELECT add_column_if_not_exists('users', 'is_active', 'BOOLEAN DEFAULT true');
SELECT add_column_if_not_exists('users', 'created_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
SELECT add_column_if_not_exists('users', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');

-- ========================================
-- TABLE: clients (ajout de colonnes manquantes)
-- ========================================
SELECT add_column_if_not_exists('clients', 'date_naissance', 'DATE');
SELECT add_column_if_not_exists('clients', 'numero_permis', 'VARCHAR(50)');
SELECT add_column_if_not_exists('clients', 'statut', 'VARCHAR(20) DEFAULT ''nouveau'' CHECK (statut IN (''nouveau'', ''actif'', ''vip'', ''inactif''))');
SELECT add_column_if_not_exists('clients', 'notes', 'TEXT');
SELECT add_column_if_not_exists('clients', 'total_depense', 'DECIMAL(12,2) DEFAULT 0');
SELECT add_column_if_not_exists('clients', 'derniere_visite', 'TIMESTAMP WITH TIME ZONE');
SELECT add_column_if_not_exists('clients', 'created_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
SELECT add_column_if_not_exists('clients', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');

-- ========================================
-- TABLE: vehicules (ajout de colonnes manquantes)
-- ========================================
SELECT add_column_if_not_exists('vehicules', 'annee', 'INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()) CHECK (annee BETWEEN 1900 AND EXTRACT(YEAR FROM NOW()) + 1)');
SELECT add_column_if_not_exists('vehicules', 'couleur', 'VARCHAR(50)');
SELECT add_column_if_not_exists('vehicules', 'carburant', 'VARCHAR(20) NOT NULL DEFAULT ''Essence'' CHECK (carburant IN (''Essence'', ''Diesel'', ''Hybride'', ''Électrique'', ''GPL'', ''Autre''))');
SELECT add_column_if_not_exists('vehicules', 'kilometrage', 'INTEGER DEFAULT 0 CHECK (kilometrage >= 0)');
SELECT add_column_if_not_exists('vehicules', 'numero_chassis', 'VARCHAR(50) UNIQUE');
SELECT add_column_if_not_exists('vehicules', 'date_acquisition', 'DATE');
SELECT add_column_if_not_exists('vehicules', 'etat', 'VARCHAR(20) DEFAULT ''Bon'' CHECK (etat IN (''Excellent'', ''Très bon'', ''Bon'', ''Moyen'', ''Mauvais'', ''Hors service''))');
SELECT add_column_if_not_exists('vehicules', 'notes', 'TEXT');
SELECT add_column_if_not_exists('vehicules', 'derniere_revision', 'DATE');
SELECT add_column_if_not_exists('vehicules', 'prochaine_revision', 'DATE');
SELECT add_column_if_not_exists('vehicules', 'assurance_expiration', 'DATE');
SELECT add_column_if_not_exists('vehicules', 'vignette_expiration', 'DATE');
SELECT add_column_if_not_exists('vehicules', 'controle_technique_expiration', 'DATE');
SELECT add_column_if_not_exists('vehicules', 'created_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
SELECT add_column_if_not_exists('vehicules', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');

-- ========================================
-- TABLE: reparations (ajout de colonnes manquantes)
-- ========================================
SELECT add_column_if_not_exists('reparations', 'technicien_id', 'UUID REFERENCES users(id)');
SELECT add_column_if_not_exists('reparations', 'statut', 'VARCHAR(20) DEFAULT ''En attente'' CHECK (statut IN (''En attente'', ''En cours'', ''Terminé'', ''Annulé'', ''Facturé''))');
SELECT add_column_if_not_exists('reparations', 'prix', 'DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (prix >= 0)');
SELECT add_column_if_not_exists('reparations', 'date_debut', 'TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()');
SELECT add_column_if_not_exists('reparations', 'date_fin', 'TIMESTAMP WITH TIME ZONE');
SELECT add_column_if_not_exists('reparations', 'priorite', 'VARCHAR(20) DEFAULT ''Normale'' CHECK (priorite IN (''Basse'', ''Normale'', ''Haute'', ''Urgente''))');
SELECT add_column_if_not_exists('reparations', 'notes', 'TEXT');
SELECT add_column_if_not_exists('reparations', 'pieces_utilisees', 'JSONB');
SELECT add_column_if_not_exists('reparations', 'temps_estime', 'INTEGER CHECK (temps_estime > 0)');
SELECT add_column_if_not_exists('reparations', 'temps_reel', 'INTEGER CHECK (temps_reel > 0)');
SELECT add_column_if_not_exists('reparations', 'created_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
SELECT add_column_if_not_exists('reparations', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');

-- ========================================
-- TABLE: pieces (ajout de colonnes manquantes)
-- ========================================
SELECT add_column_if_not_exists('pieces', 'reference', 'VARCHAR(100) UNIQUE NOT NULL DEFAULT ''REF-'' || uuid_generate_v4()::TEXT');
SELECT add_column_if_not_exists('pieces', 'categorie', 'VARCHAR(100) NOT NULL DEFAULT ''Général''');
SELECT add_column_if_not_exists('pieces', 'marque', 'VARCHAR(100)');
SELECT add_column_if_not_exists('pieces', 'modeles_compatibles', 'JSONB');
SELECT add_column_if_not_exists('pieces', 'prix_achat', 'DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (prix_achat >= 0)');
SELECT add_column_if_not_exists('pieces', 'prix_vente', 'DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (prix_vente >= 0)');
SELECT add_column_if_not_exists('pieces', 'quantite_stock', 'INTEGER DEFAULT 0 CHECK (quantite_stock >= 0)');
SELECT add_column_if_not_exists('pieces', 'quantite_minimum', 'INTEGER DEFAULT 5 CHECK (quantite_minimum >= 0)');
SELECT add_column_if_not_exists('pieces', 'fournisseur', 'VARCHAR(255)');
SELECT add_column_if_not_exists('pieces', 'localisation', 'VARCHAR(100)');
SELECT add_column_if_not_exists('pieces', 'notes', 'TEXT');
SELECT add_column_if_not_exists('pieces', 'created_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
SELECT add_column_if_not_exists('pieces', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');

-- ========================================
-- TABLE: factures (ajout de colonnes manquantes)
-- ========================================
SELECT add_column_if_not_exists('factures', 'numero', 'VARCHAR(50) UNIQUE NOT NULL DEFAULT ''FACT-'' || uuid_generate_v4()::TEXT');
SELECT add_column_if_not_exists('factures', 'montant_ht', 'DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (montant_ht >= 0)');
SELECT add_column_if_not_exists('factures', 'tva', 'DECIMAL(5,2) DEFAULT 18.5 CHECK (tva >= 0)');
SELECT add_column_if_not_exists('factures', 'montant_ttc', 'DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (montant_ttc >= 0)');
SELECT add_column_if_not_exists('factures', 'statut', 'VARCHAR(20) DEFAULT ''En attente'' CHECK (statut IN (''En attente'', ''Payée'', ''Annulée'', ''En retard''))');
SELECT add_column_if_not_exists('factures', 'date_emission', 'DATE NOT NULL DEFAULT CURRENT_DATE');
SELECT add_column_if_not_exists('factures', 'date_echeance', 'DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL ''30 days'')');
SELECT add_column_if_not_exists('factures', 'date_paiement', 'DATE');
SELECT add_column_if_not_exists('factures', 'mode_paiement', 'VARCHAR(50)');
SELECT add_column_if_not_exists('factures', 'notes', 'TEXT');
SELECT add_column_if_not_exists('factures', 'created_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
SELECT add_column_if_not_exists('factures', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');

-- ========================================
-- TABLE: notifications (ajout de colonnes manquantes)
-- ========================================
SELECT add_column_if_not_exists('notifications', 'user_id', 'UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE');
SELECT add_column_if_not_exists('notifications', 'titre', 'VARCHAR(255) NOT NULL');
SELECT add_column_if_not_exists('notifications', 'message', 'TEXT NOT NULL');
SELECT add_column_if_not_exists('notifications', 'type', 'VARCHAR(50) DEFAULT ''info'' CHECK (type IN (''info'', ''success'', ''warning'', ''error'', ''urgent''))');
SELECT add_column_if_not_exists('notifications', 'is_read', 'BOOLEAN DEFAULT false');
SELECT add_column_if_not_exists('notifications', 'action_url', 'TEXT');
SELECT add_column_if_not_exists('notifications', 'created_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');

-- ========================================
-- TABLE: historique_actions (ajout de colonnes manquantes)
-- ========================================
SELECT add_column_if_not_exists('historique_actions', 'user_id', 'UUID REFERENCES users(id)');
SELECT add_column_if_not_exists('historique_actions', 'action', 'VARCHAR(100) NOT NULL');
SELECT add_column_if_not_exists('historique_actions', 'table_name', 'VARCHAR(50)');
SELECT add_column_if_not_exists('historique_actions', 'record_id', 'UUID');
SELECT add_column_if_not_exists('historique_actions', 'details', 'JSONB');
SELECT add_column_if_not_exists('historique_actions', 'ip_address', 'INET');
SELECT add_column_if_not_exists('historique_actions', 'user_agent', 'TEXT');
SELECT add_column_if_not_exists('historique_actions', 'created_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');

-- ========================================
-- AJOUT DES CONTRAINTES MANQUANTES
-- ========================================

-- Ajouter les contraintes de clés étrangères si elles n'existent pas
DO $$
BEGIN
    -- Contrainte vehicules.proprietaire_id -> clients.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'vehicules_proprietaire_id_fkey'
    ) THEN
        ALTER TABLE vehicules ADD CONSTRAINT vehicules_proprietaire_id_fkey
        FOREIGN KEY (proprietaire_id) REFERENCES clients(id) ON DELETE CASCADE;
    END IF;

    -- Contrainte reparations.vehicule_id -> vehicules.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'reparations_vehicule_id_fkey'
    ) THEN
        ALTER TABLE reparations ADD CONSTRAINT reparations_vehicule_id_fkey
        FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE;
    END IF;

    -- Contrainte reparations.client_id -> clients.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'reparations_client_id_fkey'
    ) THEN
        ALTER TABLE reparations ADD CONSTRAINT reparations_client_id_fkey
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    END IF;

    -- Contrainte factures.client_id -> clients.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'factures_client_id_fkey'
    ) THEN
        ALTER TABLE factures ADD CONSTRAINT factures_client_id_fkey
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    END IF;

    -- Contrainte factures.reparation_id -> reparations.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'factures_reparation_id_fkey'
    ) THEN
        ALTER TABLE factures ADD CONSTRAINT factures_reparation_id_fkey
        FOREIGN KEY (reparation_id) REFERENCES reparations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ========================================
-- CRÉATION DES INDEX MANQUANTS
-- ========================================

-- Index pour les clients
CREATE INDEX IF NOT EXISTS idx_clients_nom_prenom ON clients(nom, prenom);
CREATE INDEX IF NOT EXISTS idx_clients_telephone ON clients(telephone);
CREATE INDEX IF NOT EXISTS idx_clients_statut ON clients(statut);

-- Index pour les véhicules
CREATE INDEX IF NOT EXISTS idx_vehicules_immatriculation ON vehicules(immatriculation);
CREATE INDEX IF NOT EXISTS idx_vehicules_marque_modele ON vehicules(marque, modele);
CREATE INDEX IF NOT EXISTS idx_vehicules_proprietaire ON vehicules(proprietaire_id);

-- Index pour les réparations
CREATE INDEX IF NOT EXISTS idx_reparations_dates ON reparations(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_reparations_statut ON reparations(statut);
CREATE INDEX IF NOT EXISTS idx_reparations_technicien ON reparations(technicien_id);

-- Index pour les pièces
CREATE INDEX IF NOT EXISTS idx_pieces_reference ON pieces(reference);
CREATE INDEX IF NOT EXISTS idx_pieces_categorie ON pieces(categorie);

-- Index pour les factures
CREATE INDEX IF NOT EXISTS idx_factures_numero ON factures(numero);
CREATE INDEX IF NOT EXISTS idx_factures_dates ON factures(date_emission, date_echeance);

-- ========================================
-- NETTOYAGE
-- ========================================
DROP FUNCTION IF EXISTS add_column_if_not_exists(TEXT, TEXT, TEXT);
