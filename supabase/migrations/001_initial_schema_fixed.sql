-- Schéma initial pour Garage Abidjan Dashboard (Version Corrigée)
-- Créé par Thierry Gogo - FullStack Freelance

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    adresse TEXT,
    date_naissance DATE,
    numero_permis VARCHAR(50),
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'bloque'))
);

-- Table des véhicules
CREATE TABLE IF NOT EXISTS vehicules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    marque VARCHAR(50) NOT NULL,
    modele VARCHAR(50) NOT NULL,
    annee INTEGER,
    immatriculation VARCHAR(20) UNIQUE NOT NULL,
    couleur VARCHAR(30),
    kilometrage INTEGER,
    carburant VARCHAR(20) CHECK (carburant IN ('essence', 'diesel', 'hybride', 'electrique')),
    transmission VARCHAR(20) CHECK (transmission IN ('manuelle', 'automatique')),
    date_acquisition DATE,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'hors_service', 'vendu'))
);

-- Table des interventions
CREATE TABLE IF NOT EXISTS interventions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicule_id UUID REFERENCES vehicules(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    type_intervention VARCHAR(100) NOT NULL,
    description TEXT,
    date_debut TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_fin TIMESTAMP WITH TIME ZONE,
    duree_estimee INTEGER, -- en heures
    duree_reelle INTEGER, -- en heures
    cout_estime DECIMAL(10,2),
    cout_final DECIMAL(10,2),
    statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_cours', 'termine', 'annule')),
    priorite VARCHAR(20) DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
    mecaniciens TEXT[], -- liste des mécaniciens assignés
    pieces_utilisees JSONB, -- détails des pièces utilisées
    notes TEXT,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des pièces détachées
CREATE TABLE IF NOT EXISTS pieces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference VARCHAR(100) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    categorie VARCHAR(100),
    marque VARCHAR(100),
    prix_achat DECIMAL(10,2),
    prix_vente DECIMAL(10,2),
    stock_actuel INTEGER DEFAULT 0,
    stock_minimum INTEGER DEFAULT 5,
    fournisseur VARCHAR(200),
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'rupture'))
);

-- Table des médias (GIFs, images)
CREATE TABLE IF NOT EXISTS medias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('gif', 'image', 'video')),
    url VARCHAR(500) NOT NULL,
    titre VARCHAR(200),
    description TEXT,
    categorie VARCHAR(100),
    tags TEXT[],
    taille INTEGER, -- en bytes
    largeur INTEGER,
    hauteur INTEGER,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif'))
);

-- Table des utilisateurs du système (renommée pour éviter conflit avec auth.users)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'mecanicien' CHECK (role IN ('admin', 'mecanicien', 'receptionniste')),
    telephone VARCHAR(20),
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    derniere_connexion TIMESTAMP WITH TIME ZONE,
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'bloque'))
);

-- Table des statistiques
CREATE TABLE IF NOT EXISTS statistiques (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    valeur JSONB NOT NULL,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances (avec IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom);
CREATE INDEX IF NOT EXISTS idx_clients_telephone ON clients(telephone);
CREATE INDEX IF NOT EXISTS idx_vehicules_immatriculation ON vehicules(immatriculation);
CREATE INDEX IF NOT EXISTS idx_vehicules_client_id ON vehicules(client_id);
CREATE INDEX IF NOT EXISTS idx_interventions_vehicule_id ON interventions(vehicule_id);
CREATE INDEX IF NOT EXISTS idx_interventions_client_id ON interventions(client_id);
CREATE INDEX IF NOT EXISTS idx_interventions_statut ON interventions(statut);
CREATE INDEX IF NOT EXISTS idx_interventions_date_debut ON interventions(date_debut);
CREATE INDEX IF NOT EXISTS idx_pieces_reference ON pieces(reference);
CREATE INDEX IF NOT EXISTS idx_pieces_categorie ON pieces(categorie);
CREATE INDEX IF NOT EXISTS idx_medias_categorie ON medias(categorie);
CREATE INDEX IF NOT EXISTS idx_medias_type ON medias(type);

-- Fonction pour mettre à jour automatiquement date_modification
CREATE OR REPLACE FUNCTION update_date_modification()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour automatiquement date_modification (avec DROP IF EXISTS)
DROP TRIGGER IF EXISTS update_clients_date_modification ON clients;
CREATE TRIGGER update_clients_date_modification
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

DROP TRIGGER IF EXISTS update_vehicules_date_modification ON vehicules;
CREATE TRIGGER update_vehicules_date_modification
    BEFORE UPDATE ON vehicules
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

DROP TRIGGER IF EXISTS update_interventions_date_modification ON interventions;
CREATE TRIGGER update_interventions_date_modification
    BEFORE UPDATE ON interventions
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

DROP TRIGGER IF EXISTS update_pieces_date_modification ON pieces;
CREATE TRIGGER update_pieces_date_modification
    BEFORE UPDATE ON pieces
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

-- Données de test pour les médias (GIFs) - avec ON CONFLICT DO NOTHING
INSERT INTO medias (type, url, titre, description, categorie, tags) VALUES
('gif', 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', 'Réparation Moteur', 'Animation de réparation moteur', 'reparation', ARRAY['moteur', 'reparation', 'mecanique']),
('gif', 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', 'Diagnostic Électronique', 'Animation de diagnostic électronique', 'diagnostic', ARRAY['electronique', 'diagnostic', 'obd']),
('gif', 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', 'Peinture Automobile', 'Animation de peinture automobile', 'peinture', ARRAY['peinture', 'carrosserie', 'restauration']),
('gif', 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', 'Outils Diagnostic', 'Animation d''outils de diagnostic', 'outils', ARRAY['outils', 'diagnostic', 'technique']),
('gif', 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', 'Véhicule 360°', 'Animation véhicule en rotation 360°', 'vehicule', ARRAY['vehicule', '360', 'rotation'])
ON CONFLICT DO NOTHING;

-- Données de test pour les clients - avec ON CONFLICT DO NOTHING
INSERT INTO clients (nom, prenom, telephone, email, adresse, date_naissance, numero_permis) VALUES
('Koné', 'Moussa', '+225 07 58 96 61 56', 'moussa.kone@email.com', 'Cocody, Abidjan', '1985-03-15', 'CI-123456789'),
('Traoré', 'Fatou', '+225 07 12 34 56 78', 'fatou.traore@email.com', 'Yopougon, Abidjan', '1990-07-22', 'CI-987654321'),
('Ouattara', 'Kouassi', '+225 07 98 76 54 32', 'kouassi.ouattara@email.com', 'Marcory, Abidjan', '1988-11-08', 'CI-456789123'),
('Bamba', 'Aminata', '+225 07 55 44 33 22', 'aminata.bamba@email.com', 'Plateau, Abidjan', '1992-05-30', 'CI-789123456'),
('Diabaté', 'Sékou', '+225 07 66 77 88 99', 'sekou.diabate@email.com', 'Treichville, Abidjan', '1987-09-12', 'CI-321654987')
ON CONFLICT DO NOTHING;

-- Données de test pour les véhicules - avec ON CONFLICT DO NOTHING
INSERT INTO vehicules (client_id, marque, modele, annee, immatriculation, couleur, kilometrage, carburant, transmission) VALUES
((SELECT id FROM clients WHERE nom = 'Koné' LIMIT 1), 'Toyota', 'Corolla', 2018, 'CI-123-AB', 'Blanc', 45000, 'essence', 'automatique'),
((SELECT id FROM clients WHERE nom = 'Traoré' LIMIT 1), 'Honda', 'Civic', 2019, 'CI-456-CD', 'Noir', 32000, 'essence', 'manuelle'),
((SELECT id FROM clients WHERE nom = 'Ouattara' LIMIT 1), 'Peugeot', '208', 2020, 'CI-789-EF', 'Bleu', 28000, 'diesel', 'automatique'),
((SELECT id FROM clients WHERE nom = 'Bamba' LIMIT 1), 'Renault', 'Clio', 2017, 'CI-012-GH', 'Rouge', 65000, 'essence', 'manuelle'),
((SELECT id FROM clients WHERE nom = 'Diabaté' LIMIT 1), 'Ford', 'Focus', 2021, 'CI-345-IJ', 'Gris', 15000, 'essence', 'automatique')
ON CONFLICT DO NOTHING;

-- Données de test pour les interventions - avec ON CONFLICT DO NOTHING
INSERT INTO interventions (vehicule_id, client_id, type_intervention, description, date_debut, duree_estimee, cout_estime, statut, priorite) VALUES
((SELECT id FROM vehicules WHERE immatriculation = 'CI-123-AB' LIMIT 1), (SELECT id FROM clients WHERE nom = 'Koné' LIMIT 1), 'Vidange', 'Vidange d''huile et changement de filtre', NOW() - INTERVAL '2 days', 2, 25000, 'termine', 'normale'),
((SELECT id FROM vehicules WHERE immatriculation = 'CI-456-CD' LIMIT 1), (SELECT id FROM clients WHERE nom = 'Traoré' LIMIT 1), 'Réparation Freins', 'Remplacement des plaquettes de frein', NOW() - INTERVAL '1 day', 4, 45000, 'en_cours', 'haute'),
((SELECT id FROM vehicules WHERE immatriculation = 'CI-789-EF' LIMIT 1), (SELECT id FROM clients WHERE nom = 'Ouattara' LIMIT 1), 'Diagnostic Moteur', 'Vérification du voyant moteur', NOW(), 3, 35000, 'en_attente', 'normale'),
((SELECT id FROM vehicules WHERE immatriculation = 'CI-012-GH' LIMIT 1), (SELECT id FROM clients WHERE nom = 'Bamba' LIMIT 1), 'Réparation Climatisation', 'Recharge du système de climatisation', NOW() + INTERVAL '1 day', 2, 30000, 'en_attente', 'basse'),
((SELECT id FROM vehicules WHERE immatriculation = 'CI-345-IJ' LIMIT 1), (SELECT id FROM clients WHERE nom = 'Diabaté' LIMIT 1), 'Révision Complète', 'Révision complète du véhicule', NOW() + INTERVAL '2 days', 6, 80000, 'en_attente', 'normale')
ON CONFLICT DO NOTHING;

-- Données de test pour les pièces - avec ON CONFLICT DO NOTHING
INSERT INTO pieces (reference, nom, description, categorie, marque, prix_achat, prix_vente, stock_actuel, fournisseur) VALUES
('FILT-001', 'Filtre à huile moteur', 'Filtre à huile haute qualité', 'Filtres', 'Bosch', 5000, 8000, 25, 'AutoParts CI'),
('PLAQ-001', 'Plaquettes de frein avant', 'Plaquettes de frein céramique', 'Freinage', 'Brembo', 15000, 25000, 15, 'BrakeParts'),
('BAT-001', 'Batterie 60Ah', 'Batterie automobile 60Ah', 'Électrique', 'Varta', 45000, 65000, 8, 'ElectroAuto'),
('PNEU-001', 'Pneus 205/55R16', 'Pneus été haute performance', 'Pneus', 'Michelin', 35000, 55000, 12, 'TireCenter'),
('AMP-001', 'Ampoule phare H7', 'Ampoule LED phare principal', 'Éclairage', 'Philips', 8000, 12000, 30, 'LightPro')
ON CONFLICT DO NOTHING;
