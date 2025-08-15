# Analyse des Problèmes de Permissions - Garage 2025

## 🔍 Problèmes Identifiés

### 1. **Erreur de Fonction Manquante**
- **Problème**: Le code appelle `create_profile_with_role` qui n'existe pas
- **Erreur**: `permission denied for table profiles`
- **Cause**: Fonction RPC inexistante

### 2. **Politiques RLS Trop Restrictives**
- **Table `profiles`**: Pas de politique INSERT, seulement SELECT/UPDATE
- **Table `onboarding_workflow_states`**: Politique trop restrictive pour l'onboarding initial
- **Table `super_admins`**: Politique INSERT trop restrictive pour le premier super-admin

### 3. **Problème de Séquence d'Onboarding**
- L'utilisateur ne peut pas créer son profil car il n'a pas encore de profil
- Le workflow ne peut pas être mis à jour car l'utilisateur n'a pas d'organisation
- Le super-admin ne peut pas être créé car les politiques RLS bloquent l'accès

## 🛠️ Solutions Implémentées

### 1. **Correction du Code Frontend**
- ✅ `SuperAdminSetupModal.tsx` : Remplacement de l'appel à la fonction inexistante
- ✅ Utilisation de `create_profile_bypass_rls` au lieu de `create_profile_with_role`

### 2. **Nouvelles Fonctions de Base de Données**
- ✅ `create_profile_bypass_rls()` : Fonction qui contourne RLS pour la création de profils
- ✅ Politiques RLS permissives pour l'onboarding initial

### 3. **Politiques RLS Corrigées**
- ✅ Table `profiles` : Politiques INSERT pour utilisateurs et admins
- ✅ Table `onboarding_workflow_states` : Accès pour utilisateurs authentifiés
- ✅ Table `super_admins` : Politique INSERT permissive pour le premier super-admin

## 📋 Instructions de Correction

### **Étape 1: Exécuter le Script SQL**
```bash
# Copier le contenu de fix_profiles_permissions.sql
# L'exécuter dans votre base de données Supabase (SQL Editor)
```

### **Étape 2: Vérifier les Changements**
- Les nouvelles politiques RLS doivent être visibles dans `pg_policies`
- La fonction `create_profile_bypass_rls` doit être accessible
- Les permissions sur les tables doivent être correctes

### **Étape 3: Tester l'Onboarding**
- Redémarrer l'application
- Tenter de créer un super-admin
- Vérifier que le profil est créé sans erreur

## 🔒 Sécurité Maintenue

### **Après l'Onboarding Initial**
- Les politiques RLS redeviennent restrictives
- Seuls les super-admins peuvent créer de nouveaux profils
- Les utilisateurs normaux ne peuvent modifier que leur propre profil

### **Contrôles d'Accès**
- Vérification des rôles via `get_user_role()`
- Politiques conditionnelles basées sur l'état de l'application
- Séparation des privilèges entre super-admins et utilisateurs normaux

## 🚨 Points d'Attention

### **Avant de Déployer en Production**
1. Vérifier que toutes les politiques RLS sont correctement appliquées
2. Tester l'onboarding complet avec un nouvel utilisateur
3. Vérifier que les permissions sont correctement restreintes après l'initialisation

### **Monitoring**
- Surveiller les tentatives d'accès non autorisées
- Vérifier que les politiques RLS fonctionnent comme attendu
- Tester les cas limites de permissions

## 📁 Fichiers Modifiés

1. **`src/components/SuperAdminSetupModal.tsx`** - Correction de la création de profil
2. **`fix_profiles_permissions.sql`** - Script de correction des permissions
3. **`supabase/migrations/026_fix_profiles_insert_policy.sql`** - Migration RLS
4. **`supabase/migrations/027_create_profile_bypass_rls.sql`** - Fonction de contournement

## 🔄 Prochaines Étapes

1. **Exécuter le script SQL** dans Supabase
2. **Tester l'onboarding** complet
3. **Vérifier les permissions** après l'initialisation
4. **Documenter les procédures** de création d'utilisateurs

---

**Note**: Ces corrections résolvent les problèmes d'onboarding initial tout en maintenant la sécurité de l'application. Les politiques RLS redeviennent restrictives une fois l'initialisation terminée.
