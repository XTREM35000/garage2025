# 🔧 Guide de Résolution des Erreurs SQL - Supabase

## ❌ Erreurs Courantes et Solutions

### 1. **Erreur : relation "clients" already exists**
```
ERROR: 42P07: relation "clients" already exists
```

**Solution :** Utiliser `CREATE TABLE IF NOT EXISTS` au lieu de `CREATE TABLE`

**Fichier corrigé :** `001_initial_schema_fixed.sql`

### 2. **Erreur : relation "vehicules" does not exist**
```
ERROR: 42P01: relation "vehicules" does not exist
```

**Solution :** Exécuter les migrations dans l'ordre et vérifier l'existence des tables

**Fichier corrigé :** `002_rls_policies_fixed.sql`

### 3. **Erreur : column "utilisateur_id" does not exist**
```
ERROR: 42703: column "utilisateur_id" does not exist
```

**Solution :** S'assurer que la table `profiles` existe avant de créer les références

**Fichier corrigé :** `003_notifications_fixed.sql`

## 📋 **COMMANDES SQL CORRIGÉES À EXÉCUTER**

### **Étape 1 : Migration Initiale (Sécurisée)**
```sql
-- Copier-coller le contenu de 001_initial_schema_fixed.sql
-- Cette version utilise CREATE TABLE IF NOT EXISTS
```

### **Étape 2 : RLS et Politiques (Sécurisées)**
```sql
-- Copier-coller le contenu de 002_rls_policies_fixed.sql
-- Cette version vérifie l'existence des tables avant d'activer RLS
```

### **Étape 3 : Notifications (Sécurisées)**
```sql
-- Copier-coller le contenu de 003_notifications_fixed.sql
-- Cette version gère les références de colonnes
```

## 🔍 **Vérification de l'État de la Base de Données**

### **Vérifier les tables existantes :**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### **Vérifier les politiques RLS :**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

### **Vérifier les fonctions :**
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public';
```

## 🚨 **Si les Erreurs Persistent**

### **Option 1 : Nettoyer et Recommencer**
```sql
-- ATTENTION : Ceci supprime toutes les données !
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### **Option 2 : Migration Incrémentale**
```sql
-- Exécuter chaque section séparément et vérifier les erreurs
-- Puis continuer avec la section suivante
```

## 📝 **Commandes de Diagnostic**

### **Vérifier la structure d'une table :**
```sql
\d clients
\d vehicules
\d profiles
```

### **Vérifier les contraintes :**
```sql
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'clients'::regclass;
```

### **Vérifier les triggers :**
```sql
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

## ✅ **Checklist de Validation**

Après chaque migration, vérifiez :

- [ ] **Tables créées :** `\dt` dans psql
- [ ] **RLS activé :** `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
- [ ] **Politiques créées :** `SELECT policyname FROM pg_policies WHERE schemaname = 'public';`
- [ ] **Fonctions créées :** `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';`
- [ ] **Triggers créés :** `SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';`

## 🆘 **En Cas de Problème**

### **1. Sauvegarder les données existantes :**
```sql
-- Exporter les données importantes
COPY clients TO '/tmp/clients_backup.csv' CSV HEADER;
COPY vehicules TO '/tmp/vehicules_backup.csv' CSV HEADER;
```

### **2. Vérifier les logs Supabase :**
- Aller dans le dashboard Supabase
- Section "Logs" pour voir les erreurs détaillées

### **3. Tester les requêtes une par une :**
```sql
-- Tester chaque commande individuellement
CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY);
DROP TABLE test_table;
```

## 📞 **Support**

Si les erreurs persistent :
1. Copier l'erreur exacte
2. Vérifier la version de PostgreSQL
3. Consulter la documentation Supabase
4. Tester dans un environnement de développement

---

**Fichiers corrigés créés :**
- `001_initial_schema_fixed.sql`
- `002_rls_policies_fixed.sql`
- `003_notifications_fixed.sql`

**Utilisez ces fichiers corrigés pour éviter les erreurs !**
