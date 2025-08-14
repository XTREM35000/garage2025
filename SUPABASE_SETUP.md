# 🚗 Configuration Supabase - GarageManager

Ce guide contient toutes les commandes SQL à exécuter dans l'éditeur SQL de Supabase pour configurer complètement la base de données.

## 📋 Prérequis

1. Avoir un projet Supabase créé
2. Accéder à l'éditeur SQL de Supabase (Dashboard > SQL Editor)
3. Exécuter les migrations dans l'ordre

## 🔧 Configuration

### 1. Migration Initiale (001_initial_schema.sql)

Exécutez le contenu du fichier `supabase/migrations/001_initial_schema.sql` dans l'éditeur SQL.

**Résumé :**
- Création de toutes les tables principales (clients, véhicules, interventions, pièces, médias, utilisateurs, statistiques)
- Index pour optimiser les performances
- Triggers pour mettre à jour automatiquement `date_modification`
- Données de test

### 2. RLS et Politiques de Sécurité (002_rls_policies.sql)

Exécutez le contenu du fichier `supabase/migrations/002_rls_policies.sql` dans l'éditeur SQL.

**Résumé :**
- Activation de RLS sur toutes les tables
- Création de la table `profiles` pour Supabase Auth
- Politiques de sécurité basées sur les rôles
- Fonctions utilitaires pour la gestion des utilisateurs
- Vues pour simplifier les requêtes

### 3. Notifications et Alertes (003_notifications.sql)

Exécutez le contenu du fichier `supabase/migrations/003_notifications.sql` dans l'éditeur SQL.

**Résumé :**
- Table `notifications` pour les alertes système
- Triggers automatiques pour les alertes de stock
- Fonctions de gestion des notifications
- Politiques RLS pour les notifications

## 🚀 Edge Functions

### Déploiement des Edge Functions

1. **Installer Supabase CLI :**
```bash
npm install -g supabase
```

2. **Se connecter à votre projet :**
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

3. **Déployer les Edge Functions :**
```bash
supabase functions deploy create-admin
supabase functions deploy generate-report
supabase functions deploy notify-stock-alert
```

## 🔐 Configuration de l'Authentification

### 1. Activer l'Authentification par Email

Dans le dashboard Supabase :
1. Aller à **Authentication > Settings**
2. Activer **Enable email confirmations**
3. Configurer les templates d'email si nécessaire

### 2. Créer un Utilisateur Admin

Utilisez l'Edge Function `create-admin` ou créez manuellement :

```sql
-- Via l'interface Supabase Auth ou l'Edge Function
-- Email: admin@garage.com
-- Mot de passe: admin123
-- Rôle: proprietaire
```

### 3. Configuration des Rôles

Les rôles disponibles :
- `proprietaire` : Accès total
- `chef-garagiste` : Gestion des réparations et équipe
- `technicien` : Accès aux interventions et véhicules
- `comptable` : Accès aux statistiques et facturation

## 📊 Buckets de Stockage

### 1. Créer les Buckets

Dans le dashboard Supabase > Storage :

```sql
-- Bucket pour les avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Bucket pour les documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Bucket pour les images de véhicules
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicles', 'vehicles', true);
```

### 2. Politiques de Stockage

```sql
-- Politiques pour avatars
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politiques pour documents
CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politiques pour images de véhicules
CREATE POLICY "Vehicle images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'vehicles');

CREATE POLICY "Authenticated users can upload vehicle images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vehicles' AND auth.role() = 'authenticated');
```

## 🔧 Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📱 Test de la Configuration

### 1. Test des Politiques RLS

```sql
-- Test de lecture des clients (doit fonctionner si authentifié)
SELECT * FROM clients LIMIT 5;

-- Test de création d'un client (doit échouer si pas le bon rôle)
INSERT INTO clients (nom, prenom, telephone)
VALUES ('Test', 'User', '+225 123456789');
```

### 2. Test des Edge Functions

```bash
# Test de création d'admin
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/create-admin' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@test.com","password":"test123","role":"proprietaire"}'

# Test de génération de rapport
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/generate-report' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"reportType":"dashboard"}'
```

## 🚨 Alertes et Notifications

### 1. Test des Alertes de Stock

```sql
-- Créer une pièce avec stock faible pour tester l'alerte
INSERT INTO pieces (reference, nom, stock_actuel, stock_minimum)
VALUES ('TEST-001', 'Pièce Test', 2, 5);

-- Vérifier que la notification a été créée
SELECT * FROM notifications WHERE type = 'stock_alert' ORDER BY date_creation DESC;
```

### 2. Test des Notifications

```sql
-- Créer une notification manuelle
SELECT create_notification(
  'test',
  'Test Notification',
  'Ceci est un test de notification',
  '{"test": true}'
);

-- Récupérer les notifications non lues
SELECT * FROM get_unread_notifications();
```

## 📈 Fonctions Utilitaires

### 1. Statistiques du Dashboard

```sql
-- Obtenir les statistiques complètes
SELECT * FROM get_dashboard_stats();

-- Statistiques des notifications
SELECT * FROM get_notification_stats();
```

### 2. Recherche de Clients

```sql
-- Rechercher des clients
SELECT * FROM search_clients('Koné');
```

### 3. Historique des Véhicules

```sql
-- Obtenir l'historique d'un véhicule
SELECT * FROM get_vehicle_history('vehicle-uuid-here');
```

## 🔄 Maintenance

### 1. Nettoyage des Notifications

```sql
-- Nettoyer les anciennes notifications (plus de 30 jours)
SELECT cleanup_old_notifications(30);
```

### 2. Sauvegarde des Données

```sql
-- Exporter les données importantes
COPY clients TO '/tmp/clients_backup.csv' CSV HEADER;
COPY interventions TO '/tmp/interventions_backup.csv' CSV HEADER;
```

## 🐛 Dépannage

### Problèmes Courants

1. **Erreur RLS :** Vérifiez que l'utilisateur est authentifié et a les bonnes permissions
2. **Edge Functions non accessibles :** Vérifiez que les fonctions sont déployées et que les clés API sont correctes
3. **Notifications non créées :** Vérifiez que les triggers sont actifs et que les fonctions `create_notification` existent

### Commandes de Diagnostic

```sql
-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- Vérifier les triggers
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Vérifier les fonctions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public';
```

## ✅ Checklist de Validation

- [ ] Toutes les tables créées
- [ ] RLS activé sur toutes les tables
- [ ] Politiques de sécurité configurées
- [ ] Edge Functions déployées
- [ ] Buckets de stockage créés
- [ ] Variables d'environnement configurées
- [ ] Tests de base effectués
- [ ] Utilisateur admin créé
- [ ] Notifications fonctionnelles
- [ ] Alertes de stock actives

## 📞 Support

Pour toute question ou problème :
- Consultez la documentation Supabase
- Vérifiez les logs dans le dashboard Supabase
- Testez les requêtes dans l'éditeur SQL

---

**Créé par Thierry Gogo - FullStack Freelance**
**Projet : GarageManager - Dashboard Garage Abidjan**
