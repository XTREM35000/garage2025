-- Migration 003: Table Notifications et Triggers d'Alerte (Version Corrigée)
-- Créé par Thierry Gogo - FullStack Freelance

-- 1. Créer la table notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    donnees JSONB,
    utilisateur_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_lecture TIMESTAMP WITH TIME ZONE,
    statut VARCHAR(20) DEFAULT 'non_lu' CHECK (statut IN ('non_lu', 'lu', 'archive'))
);

-- 2. Activer RLS sur notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. Politiques pour notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = utilisateur_id OR utilisateur_id IS NULL);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = utilisateur_id);

DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
CREATE POLICY "Admins can view all notifications" ON notifications
    FOR SELECT USING (get_user_role() IN ('proprietaire', 'chef-garagiste'));

-- 4. Index pour notifications
CREATE INDEX IF NOT EXISTS idx_notifications_utilisateur_id ON notifications(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_statut ON notifications(statut);
CREATE INDEX IF NOT EXISTS idx_notifications_date_creation ON notifications(date_creation);

-- 5. Fonction pour créer une notification
CREATE OR REPLACE FUNCTION create_notification(
    p_type VARCHAR(50),
    p_titre VARCHAR(200),
    p_message TEXT,
    p_donnees JSONB DEFAULT NULL,
    p_utilisateur_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (type, titre, message, donnees, utilisateur_id)
    VALUES (p_type, p_titre, p_message, p_donnees, p_utilisateur_id)
    RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction pour marquer une notification comme lue
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications
    SET statut = 'lu', date_lecture = NOW()
    WHERE id = notification_id AND (utilisateur_id = auth.uid() OR utilisateur_id IS NULL);

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Fonction pour obtenir les notifications non lues
CREATE OR REPLACE FUNCTION get_unread_notifications()
RETURNS TABLE (
    id UUID,
    type VARCHAR(50),
    titre VARCHAR(200),
    message TEXT,
    donnees JSONB,
    date_creation TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT n.id, n.type, n.titre, n.message, n.donnees, n.date_creation
    FROM notifications n
    WHERE n.statut = 'non_lu'
    AND (n.utilisateur_id = auth.uid() OR n.utilisateur_id IS NULL)
    ORDER BY n.date_creation DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger pour alerte de stock faible
CREATE OR REPLACE FUNCTION check_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le stock devient faible ou en rupture
    IF NEW.stock_actuel <= NEW.stock_minimum THEN
        -- Créer une notification
        PERFORM create_notification(
            'stock_alert',
            'Alerte Stock',
            CASE
                WHEN NEW.stock_actuel = 0 THEN
                    'Rupture de stock pour ' || NEW.nom || ' (' || NEW.reference || ')'
                ELSE
                    'Stock faible pour ' || NEW.nom || ' (' || NEW.reference || ') - Quantité: ' || NEW.stock_actuel
            END,
            json_build_object(
                'piece_id', NEW.id,
                'piece_nom', NEW.nom,
                'piece_reference', NEW.reference,
                'stock_actuel', NEW.stock_actuel,
                'stock_minimum', NEW.stock_minimum,
                'action', CASE WHEN NEW.stock_actuel = 0 THEN 'rupture' ELSE 'stock_faible' END
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Créer le trigger pour les alertes de stock
DROP TRIGGER IF EXISTS trigger_stock_alert ON pieces;
CREATE TRIGGER trigger_stock_alert
    AFTER UPDATE OF stock_actuel ON pieces
    FOR EACH ROW
    EXECUTE FUNCTION check_stock_alert();

-- 10. Trigger pour alerte de stock faible lors de l'insertion
CREATE OR REPLACE FUNCTION check_stock_alert_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le stock est faible ou en rupture dès l'insertion
    IF NEW.stock_actuel <= NEW.stock_minimum THEN
        -- Créer une notification
        PERFORM create_notification(
            'stock_alert',
            'Alerte Stock',
            CASE
                WHEN NEW.stock_actuel = 0 THEN
                    'Rupture de stock pour ' || NEW.nom || ' (' || NEW.reference || ')'
                ELSE
                    'Stock faible pour ' || NEW.nom || ' (' || NEW.reference || ') - Quantité: ' || NEW.stock_actuel
            END,
            json_build_object(
                'piece_id', NEW.id,
                'piece_nom', NEW.nom,
                'piece_reference', NEW.reference,
                'stock_actuel', NEW.stock_actuel,
                'stock_minimum', NEW.stock_minimum,
                'action', CASE WHEN NEW.stock_actuel = 0 THEN 'rupture' ELSE 'stock_faible' END
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Créer le trigger pour les alertes de stock lors de l'insertion
DROP TRIGGER IF EXISTS trigger_stock_alert_insert ON pieces;
CREATE TRIGGER trigger_stock_alert_insert
    AFTER INSERT ON pieces
    FOR EACH ROW
    EXECUTE FUNCTION check_stock_alert_insert();

-- 12. Fonction pour nettoyer les anciennes notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE date_creation < NOW() - INTERVAL '1 day' * days_to_keep
    AND statut = 'lu';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Fonction pour obtenir les statistiques des notifications
CREATE OR REPLACE FUNCTION get_notification_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', (SELECT COUNT(*) FROM notifications),
        'non_lues', (SELECT COUNT(*) FROM notifications WHERE statut = 'non_lu'),
        'lues', (SELECT COUNT(*) FROM notifications WHERE statut = 'lu'),
        'archives', (SELECT COUNT(*) FROM notifications WHERE statut = 'archive'),
        'aujourd_hui', (SELECT COUNT(*) FROM notifications WHERE date_creation >= date_trunc('day', NOW()))
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Données de test pour les notifications
INSERT INTO notifications (type, titre, message, donnees) VALUES
('system', 'Bienvenue sur GarageManager', 'Votre compte a été créé avec succès. Bienvenue dans votre espace de gestion de garage !', '{"action": "welcome"}'),
('info', 'Maintenance système', 'Une maintenance est prévue ce soir à 23h00. Le système sera temporairement indisponible.', '{"maintenance_time": "23:00"}'),
('success', 'Sauvegarde automatique', 'La sauvegarde automatique de vos données a été effectuée avec succès.', '{"backup_time": "2024-01-15T02:00:00Z"}')
ON CONFLICT DO NOTHING;

-- 15. Vérifier et créer des alertes pour les pièces en stock faible existantes
DO $$
DECLARE
    piece_record RECORD;
BEGIN
    FOR piece_record IN
        SELECT id, nom, reference, stock_actuel, stock_minimum
        FROM pieces
        WHERE stock_actuel <= stock_minimum
    LOOP
        PERFORM create_notification(
            'stock_alert',
            'Alerte Stock',
            CASE
                WHEN piece_record.stock_actuel = 0 THEN
                    'Rupture de stock pour ' || piece_record.nom || ' (' || piece_record.reference || ')'
                ELSE
                    'Stock faible pour ' || piece_record.nom || ' (' || piece_record.reference || ') - Quantité: ' || piece_record.stock_actuel
            END,
            json_build_object(
                'piece_id', piece_record.id,
                'piece_nom', piece_record.nom,
                'piece_reference', piece_record.reference,
                'stock_actuel', piece_record.stock_actuel,
                'stock_minimum', piece_record.stock_minimum,
                'action', CASE WHEN piece_record.stock_actuel = 0 THEN 'rupture' ELSE 'stock_faible' END
            )
        );
    END LOOP;
END $$;
