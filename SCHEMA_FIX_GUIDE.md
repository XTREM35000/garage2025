# 🔧 Guide de Résolution - Problème de Schéma

## 🚨 **Problème Identifié**

```
ERROR: 42703: column "immatriculation" does not exist
```

Cette erreur indique que les tables existent déjà mais avec une structure différente de celle attendue.

## 🔍 **Diagnostic**

### **Étape 1 : Vérifier l'état actuel**
```bash
# Exécuter le script de diagnostic
supabase db reset --linked
```

Ou exécuter manuellement le fichier `supabase/migrations/008_diagnostic_schema.sql` pour voir l'état actuel.

### **Étape 2 : Identifier le problème**
Le problème vient du fait que :
1. Les tables existent déjà avec une structure différente
2. La migration essaie de créer des colonnes qui n'existent pas dans la structure actuelle
3. Il y a un conflit entre l'ancienne et la nouvelle structure

## 🛠️ **Solutions**

### **Solution 1 : Reset Complet (Recommandé pour le développement)**

```bash
# 1. Supprimer complètement la base de données
supabase db reset --linked

# 2. Appliquer les nouvelles migrations dans l'ordre
supabase db push

# 3. Déployer les fonctions Edge
supabase functions deploy inject-demo-data
supabase functions deploy clear-demo-data
```

### **Solution 2 : Migration Progressive (Pour la production)**

```bash
# 1. Exécuter d'abord la migration de diagnostic
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/008_diagnostic_schema.sql

# 2. Exécuter la migration de correction
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/007_add_missing_columns.sql

# 3. Exécuter la migration RLS
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/005_rls_policies.sql
```

### **Solution 3 : Migration Manuelle**

Si les solutions automatiques ne fonctionnent pas :

```sql
-- 1. Vérifier les tables existantes
\dt

-- 2. Vérifier la structure de la table vehicules
\d vehicules

-- 3. Ajouter la colonne manquante si elle n'existe pas
ALTER TABLE vehicules ADD COLUMN IF NOT EXISTS immatriculation VARCHAR(20);

-- 4. Ajouter la contrainte UNIQUE si nécessaire
ALTER TABLE vehicules ADD CONSTRAINT vehicules_immatriculation_unique UNIQUE (immatriculation);
```

## 📋 **Structure Attendue**

### **Table `vehicules` (Structure complète) :**
```sql
CREATE TABLE vehicules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100) NOT NULL,
    immatriculation VARCHAR(20) UNIQUE NOT NULL,  -- ← Cette colonne manque
    annee INTEGER NOT NULL,
    couleur VARCHAR(50),
    carburant VARCHAR(20) NOT NULL,
    kilometrage INTEGER DEFAULT 0,
    proprietaire_id UUID NOT NULL REFERENCES clients(id),
    numero_chassis VARCHAR(50) UNIQUE,
    date_acquisition DATE,
    etat VARCHAR(20) DEFAULT 'Bon',
    notes TEXT,
    derniere_revision DATE,
    prochaine_revision DATE,
    assurance_expiration DATE,
    vignette_expiration DATE,
    controle_technique_expiration DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 **Ordre d'Exécution des Migrations**

### **Pour un environnement propre :**
1. `004_complete_schema.sql` - Structure complète
2. `005_rls_policies.sql` - Politiques de sécurité
3. `008_diagnostic_schema.sql` - Vérification

### **Pour un environnement existant :**
1. `008_diagnostic_schema.sql` - Diagnostic
2. `007_add_missing_columns.sql` - Ajout des colonnes manquantes
3. `005_rls_policies.sql` - Politiques de sécurité

## 🚀 **Test de la Solution**

### **Après avoir appliqué les migrations :**

1. **Vérifier la structure :**
```sql
\d vehicules
```

2. **Tester l'insertion :**
```sql
INSERT INTO vehicules (marque, modele, immatriculation, annee, proprietaire_id)
VALUES ('Toyota', 'Corolla', 'CI-123-AB-456', 2018, 'uuid-du-client');
```

3. **Tester les fonctions de démo :**
```bash
# Via l'interface utilisateur
# Cliquer sur l'avatar → Admin → "Injecter données démo"
```

## ⚠️ **Points d'Attention**

### **Données existantes :**
- Si vous avez des données importantes, faites une sauvegarde avant
- La migration progressive préserve les données existantes
- Le reset complet supprime toutes les données

### **Contraintes :**
- Les contraintes de clés étrangères peuvent échouer si les données ne sont pas cohérentes
- Vérifiez les données avant d'ajouter les contraintes

### **Performance :**
- L'ajout de colonnes sur de grandes tables peut prendre du temps
- Les index sont créés après les colonnes pour optimiser les performances

## 🎯 **Solution Recommandée**

Pour un environnement de développement, utilisez la **Solution 1** (Reset complet) :

```bash
# 1. Reset complet
supabase db reset --linked

# 2. Appliquer les migrations
supabase db push

# 3. Déployer les fonctions
supabase functions deploy inject-demo-data
supabase functions deploy clear-demo-data

# 4. Tester
# Aller dans l'application et cliquer sur "Injecter données démo"
```

Cette solution garantit une base de données propre avec la structure correcte. 🎉
