# 🚨 Résolution Rapide - Erreur 404 create_profile_bypass_rls

## ❌ Problème Identifié

```
ERROR: 42883: function get_user_role() does not exist
POST /rest/v1/rpc/create_profile_bypass_rls 404 (Not Found)
Could not find the function public.create_profile_bypass_rls
```

## 🛠️ Solution Immédiate

### Option 1 : Script Simplifié (Recommandé)
Utilisez le fichier **`fix_profiles_permissions_simple.sql`** qui :
- ✅ **Évite les fonctions inexistantes**
- ✅ **Crée des politiques RLS simples**
- ✅ **Permet l'onboarding sans restrictions**

### Option 2 : Script Corrigé
Utilisez le fichier **`fix_profiles_permissions.sql`** corrigé qui :
- ✅ **Remplace `get_user_role()` par des vérifications directes**
- ✅ **Maintient la sécurité RLS**
- ✅ **Gère les permissions de manière appropriée**

## 🚀 Étapes de Résolution

### 1. Exécuter le Script SQL
```bash
# Dans Supabase SQL Editor :
# 1. Ouvrir le fichier fix_profiles_permissions_simple.sql
# 2. Copier-coller le contenu
# 3. Cliquer sur "Run"
```

### 2. Vérifier la Création
```sql
-- Vérifier que la fonction existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_profile_bypass_rls';

-- Vérifier les politiques créées
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'super_admins', 'onboarding_workflow_states');
```

### 3. Redémarrer l'Application
```bash
npm run dev
```

## 🔍 Vérifications Post-Exécution

### ✅ Fonction Créée
```sql
-- Résultat attendu :
routine_name: create_profile_bypass_rls
routine_type: FUNCTION
```

### ✅ Politiques RLS
```sql
-- Résultat attendu :
tablename: profiles
policyname: profiles_insert_policy
cmd: INSERT
```

### ✅ Permissions Accordées
```sql
-- Vérifier les permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles';
```

## 🧪 Test de la Correction

### 1. Console du Navigateur
```bash
# Vérifier que ces logs apparaissent :
🔍 Vérification du workflow...
👑 Super admin existe: false
⚠️ Pas de super admin -> Étape SUPER_ADMIN (initialisation)
```

### 2. Formulaire Super Admin
- ✅ **S'affiche automatiquement** après le SplashScreen
- ✅ **Permet la création** du premier super admin
- ✅ **Passe à l'étape suivante** sans erreur

### 3. Base de Données
```sql
-- Vérifier la création
SELECT * FROM super_admins;
SELECT * FROM profiles;
```

## 🚨 Cas d'Erreur Courants

### Erreur 1 : Fonction toujours inexistante
```bash
# Solution : Vérifier que le script a été exécuté
# et qu'il n'y a pas d'erreurs de syntaxe
```

### Erreur 2 : Permissions insuffisantes
```bash
# Solution : Vérifier que l'utilisateur Supabase
# a les droits d'exécution du script
```

### Erreur 3 : Tables inexistantes
```bash
# Solution : Vérifier que les tables profiles,
# super_admins et onboarding_workflow_states existent
```

## 📋 Checklist de Validation

- [ ] **Script SQL exécuté** sans erreur
- [ ] **Fonction `create_profile_bypass_rls`** créée
- **Politiques RLS** configurées
- [ ] **Application redémarrée**
- [ ] **Formulaire Super Admin** s'affiche
- [ ] **Création Super Admin** fonctionne
- [ ] **Transition vers Pricing** réussie

## 🎯 Résultat Attendu

Après exécution du script :
1. ✅ **Fonction `create_profile_bypass_rls`** disponible
2. ✅ **Politiques RLS** configurées
3. ✅ **Workflow d'onboarding** fonctionnel
4. ✅ **Création de profils** sans erreur 404
5. ✅ **Progression automatique** entre étapes

## 🔧 Alternative de Dernier Recours

Si les scripts SQL ne fonctionnent pas :

### Option A : Désactiver RLS Temporairement
```sql
-- Désactiver RLS sur les tables critiques
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_workflow_states DISABLE ROW LEVEL SECURITY;
```

### Option B : Utiliser des Inserts Directs
```sql
-- Insérer directement dans profiles
INSERT INTO profiles (id, email, nom, role, is_active, created_at, updated_at)
VALUES (uuid_generate_v4(), 'admin@example.com', 'Admin', 'admin', true, NOW(), NOW());
```

---

**Note** : Utilisez d'abord le script simplifié `fix_profiles_permissions_simple.sql` qui est le plus robuste et évite les erreurs de fonctions inexistantes.
