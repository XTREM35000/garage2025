-- Migration 002: RLS Policies et Configuration Auth (Version Corrigée)
-- Créé par Thierry Gogo - FullStack Freelance

-- 1. Activer RLS sur toutes les tables (avec vérification d'existence)
DO $$
BEGIN
    -- Vérifier et activer RLS sur clients
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Vérifier et activer RLS sur vehicules
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vehicules') THEN
        ALTER TABLE vehicules ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Vérifier et activer RLS sur interventions
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'interventions') THEN
        ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Vérifier et activer RLS sur pieces
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pieces') THEN
        ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Vérifier et activer RLS sur medias
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'medias') THEN
        ALTER TABLE medias ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Vérifier et activer RLS sur statistiques
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'statistiques') THEN
        ALTER TABLE statistiques ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Créer la table profiles pour Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    role VARCHAR(20) DEFAULT 'technicien' CHECK (role IN ('proprietaire', 'chef-garagiste', 'technicien', 'comptable')),
    telephone VARCHAR(20),
    avatar_url TEXT,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'bloque'))
);

-- 3. Activer RLS sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Fonction pour obtenir l'utilisateur connecté
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Fonction pour obtenir le rôle de l'utilisateur
CREATE OR REPLACE FUNCTION get_user_role() RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
    RETURN COALESCE(user_role, 'technicien');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Politiques pour la table profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (get_user_role() IN ('proprietaire', 'chef-garagiste'));

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (get_user_role() IN ('proprietaire', 'chef-garagiste'));

-- 7. Politiques pour la table clients
DROP POLICY IF EXISTS "All authenticated users can view clients" ON clients;
CREATE POLICY "All authenticated users can view clients" ON clients
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins and receptionists can create clients" ON clients;
CREATE POLICY "Admins and receptionists can create clients" ON clients
    FOR INSERT WITH CHECK (get_user_role() IN ('proprietaire', 'chef-garagiste', 'comptable'));

DROP POLICY IF EXISTS "Admins and receptionists can update clients" ON clients;
CREATE POLICY "Admins and receptionists can update clients" ON clients
    FOR UPDATE USING (get_user_role() IN ('proprietaire', 'chef-garagiste', 'comptable'));

DROP POLICY IF EXISTS "Admins can delete clients" ON clients;
CREATE POLICY "Admins can delete clients" ON clients
    FOR DELETE USING (get_user_role() = 'proprietaire');

-- 8. Politiques pour la table vehicules
DROP POLICY IF EXISTS "All authenticated users can view vehicles" ON vehicules;
CREATE POLICY "All authenticated users can view vehicles" ON vehicules
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins and mechanics can create vehicles" ON vehicules;
CREATE POLICY "Admins and mechanics can create vehicles" ON vehicules
    FOR INSERT WITH CHECK (get_user_role() IN ('proprietaire', 'chef-garagiste', 'technicien'));

DROP POLICY IF EXISTS "Admins and mechanics can update vehicles" ON vehicules;
CREATE POLICY "Admins and mechanics can update vehicles" ON vehicules
    FOR UPDATE USING (get_user_role() IN ('proprietaire', 'chef-garagiste', 'technicien'));

DROP POLICY IF EXISTS "Admins can delete vehicles" ON vehicules;
CREATE POLICY "Admins can delete vehicles" ON vehicules
    FOR DELETE USING (get_user_role() = 'proprietaire');

-- 9. Politiques pour la table interventions
DROP POLICY IF EXISTS "All authenticated users can view interventions" ON interventions;
CREATE POLICY "All authenticated users can view interventions" ON interventions
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins and mechanics can create interventions" ON interventions;
CREATE POLICY "Admins and mechanics can create interventions" ON interventions
    FOR INSERT WITH CHECK (get_user_role() IN ('proprietaire', 'chef-garagiste', 'technicien'));

DROP POLICY IF EXISTS "Admins and mechanics can update interventions" ON interventions;
CREATE POLICY "Admins and mechanics can update interventions" ON interventions
    FOR UPDATE USING (get_user_role() IN ('proprietaire', 'chef-garagiste', 'technicien'));

DROP POLICY IF EXISTS "Admins can delete interventions" ON interventions;
CREATE POLICY "Admins can delete interventions" ON interventions
    FOR DELETE USING (get_user_role() = 'proprietaire');

-- 10. Politiques pour la table pieces
DROP POLICY IF EXISTS "All authenticated users can view pieces" ON pieces;
CREATE POLICY "All authenticated users can view pieces" ON pieces
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins and accountants can create pieces" ON pieces;
CREATE POLICY "Admins and accountants can create pieces" ON pieces
    FOR INSERT WITH CHECK (get_user_role() IN ('proprietaire', 'chef-garagiste', 'comptable'));

DROP POLICY IF EXISTS "Admins and accountants can update pieces" ON pieces;
CREATE POLICY "Admins and accountants can update pieces" ON pieces
    FOR UPDATE USING (get_user_role() IN ('proprietaire', 'chef-garagiste', 'comptable'));

DROP POLICY IF EXISTS "Admins can delete pieces" ON pieces;
CREATE POLICY "Admins can delete pieces" ON pieces
    FOR DELETE USING (get_user_role() = 'proprietaire');

-- 11. Politiques pour la table medias
DROP POLICY IF EXISTS "All authenticated users can view medias" ON medias;
CREATE POLICY "All authenticated users can view medias" ON medias
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage medias" ON medias;
CREATE POLICY "Admins can manage medias" ON medias
    FOR ALL USING (get_user_role() = 'proprietaire');

-- 12. Politiques pour la table statistiques
DROP POLICY IF EXISTS "All authenticated users can view statistics" ON statistiques;
CREATE POLICY "All authenticated users can view statistics" ON statistiques
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage statistics" ON statistiques;
CREATE POLICY "Admins can manage statistics" ON statistiques
    FOR ALL USING (get_user_role() = 'proprietaire');

-- 13. Trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nom, prenom, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nom', ''),
        COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'technicien')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. Fonction pour obtenir les statistiques du dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'clients', (SELECT COUNT(*) FROM clients WHERE statut = 'actif'),
        'vehicules', (SELECT COUNT(*) FROM vehicules WHERE statut = 'actif'),
        'interventions_en_cours', (SELECT COUNT(*) FROM interventions WHERE statut = 'en_cours'),
        'pieces_rupture', (SELECT COUNT(*) FROM pieces WHERE stock_actuel <= stock_minimum),
        'chiffre_affaires_mois', (
            SELECT COALESCE(SUM(cout_final), 0)
            FROM interventions
            WHERE statut = 'termine'
            AND date_fin >= date_trunc('month', CURRENT_DATE)
        ),
        'interventions_urgentes', (
            SELECT COUNT(*)
            FROM interventions
            WHERE priorite = 'urgente' AND statut IN ('en_attente', 'en_cours')
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Fonction pour rechercher des clients
CREATE OR REPLACE FUNCTION search_clients(search_term TEXT)
RETURNS TABLE (
    id UUID,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(255),
    adresse TEXT,
    statut VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nom, c.prenom, c.telephone, c.email, c.adresse, c.statut
    FROM clients c
    WHERE c.statut = 'actif'
    AND (
        c.nom ILIKE '%' || search_term || '%' OR
        c.prenom ILIKE '%' || search_term || '%' OR
        c.telephone ILIKE '%' || search_term || '%' OR
        c.email ILIKE '%' || search_term || '%'
    )
    ORDER BY c.nom, c.prenom;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Fonction pour obtenir l'historique des interventions d'un véhicule
CREATE OR REPLACE FUNCTION get_vehicle_history(vehicle_id UUID)
RETURNS TABLE (
    id UUID,
    type_intervention VARCHAR(100),
    description TEXT,
    date_debut TIMESTAMP WITH TIME ZONE,
    date_fin TIMESTAMP WITH TIME ZONE,
    statut VARCHAR(20),
    cout_final DECIMAL(10,2),
    mecaniciens TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.type_intervention, i.description, i.date_debut, i.date_fin,
           i.statut, i.cout_final, i.mecaniciens
    FROM interventions i
    WHERE i.vehicule_id = vehicle_id
    ORDER BY i.date_debut DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. Index supplémentaires pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_interventions_date_fin ON interventions(date_fin);
CREATE INDEX IF NOT EXISTS idx_interventions_priorite ON interventions(priorite);
CREATE INDEX IF NOT EXISTS idx_pieces_stock_actuel ON pieces(stock_actuel);
CREATE INDEX IF NOT EXISTS idx_statistiques_date_type ON statistiques(date, type);

-- 19. Vues pour simplifier les requêtes courantes
CREATE OR REPLACE VIEW interventions_completes AS
SELECT
    i.*,
    v.marque,
    v.modele,
    v.immatriculation,
    c.nom as client_nom,
    c.prenom as client_prenom,
    c.telephone as client_telephone
FROM interventions i
JOIN vehicules v ON i.vehicule_id = v.id
JOIN clients c ON i.client_id = c.id;

CREATE OR REPLACE VIEW pieces_stock_faible AS
SELECT
    p.*,
    CASE
        WHEN p.stock_actuel = 0 THEN 'Rupture'
        WHEN p.stock_actuel <= p.stock_minimum THEN 'Stock faible'
        ELSE 'Stock normal'
    END as statut_stock
FROM pieces p
WHERE p.stock_actuel <= p.stock_minimum
ORDER BY p.stock_actuel ASC;

-- 20. Politiques pour les vues
DROP POLICY IF EXISTS "All authenticated users can view interventions_completes" ON interventions_completes;
CREATE POLICY "All authenticated users can view interventions_completes" ON interventions_completes
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All authenticated users can view pieces_stock_faible" ON pieces_stock_faible;
CREATE POLICY "All authenticated users can view pieces_stock_faible" ON pieces_stock_faible
    FOR SELECT USING (auth.role() = 'authenticated');
