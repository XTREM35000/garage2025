# Guide de Correction de la Création d'Organisations

## 🔍 Problèmes Identifiés

### 1. Erreur PGRST203 - Résolution de fonction
- **Cause** : Incohérence entre la définition de la fonction et le schéma réel de la base de données
- **Problème** : La fonction utilisait `organisation_id` (pluriel) au lieu de `organization_id` (singulier)
- **Problème** : La colonne `role` était manquante dans l'insertion `user_organizations`

### 2. Erreur 42501 - Permission refusée
- **Cause** : Politiques RLS trop restrictives sur la table `organisations`
- **Problème** : Les utilisateurs authentifiés ne pouvaient pas insérer de nouvelles organisations

## ✅ Corrections Apportées

### 1. Cohérence du Schéma
- **Restauration** : Utilisation de `organization_id` (singulier) comme défini dans le schéma
- **Restauration** : Inclusion de la colonne `role` avec la valeur `'superadmin'`
- **Vérification** : Ajout de vérifications de schéma dans la migration

### 2. Fonction SQL Corrigée
```sql
-- Insertion correcte dans user_organizations
INSERT INTO public.user_organizations (
    user_id,
    organization_id,  -- ✅ Singulier, conforme au schéma
    role              -- ✅ Colonne role incluse
) VALUES (
    owner_user_id,
    new_org_id,
    'superadmin'      -- ✅ Rôle approprié pour le créateur
);
```

### 3. Politiques RLS Optimisées
- **Insertion** : Permise pour tous les utilisateurs authentifiés
- **Lecture** : Permise pour tous (politique permissive)
- **Modification** : Restreinte aux admins et superadmins de l'organisation
- **Suppression** : Restreinte aux superadmins de l'organisation

## 🚀 Déploiement

### Option 1: Via Supabase Dashboard
1. Ouvrir le projet Supabase
2. Aller dans **SQL Editor**
3. Copier le contenu de `supabase/migrations/025_fix_organization_creation.sql`
4. Exécuter le script

### Option 2: Via CLI Supabase
```bash
# Appliquer la migration
supabase db push

# Ou appliquer une migration spécifique
supabase db reset --linked
```

### Option 3: Via Migration Manuelle
1. Se connecter à la base de données PostgreSQL
2. Exécuter le script de migration
3. Vérifier avec le script de test

## 🧪 Vérification

### 1. Exécuter le Script de Test
```sql
-- Exécuter le fichier test_organization_creation.sql
-- Vérifier que toutes les vérifications passent
```

### 2. Test Manuel
```sql
-- Vérifier que la fonction existe
SELECT routine_name, security_type 
FROM information_schema.routines 
WHERE routine_name = 'create_organization_with_owner';

-- Vérifier les politiques RLS
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'organisations';
```

### 3. Test de Création
- Tenter de créer une organisation via l'interface utilisateur
- Vérifier que l'organisation est créée
- Vérifier que la relation `user_organizations` est créée avec le bon rôle

## 📋 Vérifications Post-Déploiement

### ✅ Fonction
- [ ] Fonction `create_organization_with_owner` existe
- [ ] Fonction a le bon type de sécurité (`SECURITY DEFINER`)
- [ ] Fonction retourne un `uuid`

### ✅ Schéma
- [ ] Table `user_organizations` utilise `organization_id` (singulier)
- [ ] Colonne `role` existe dans `user_organizations`
- [ ] Contraintes de clé étrangère sont correctes

### ✅ Politiques RLS
- [ ] RLS activé sur `organisations`
- [ ] Politique d'insertion permet aux utilisateurs authentifiés
- [ ] Politiques de modification/suppression sont restrictives

### ✅ Permissions
- [ ] Utilisateurs authentifiés peuvent exécuter la fonction
- [ ] Utilisateurs authentifiés peuvent insérer dans `organisations`
- [ ] Seuls les admins peuvent modifier leurs organisations

## 🚨 Résolution des Problèmes

### Si l'erreur PGRST203 persiste
1. Vérifier que la fonction a été recréée
2. Vérifier la signature exacte des paramètres
3. Redémarrer le service PostgREST si nécessaire

### Si l'erreur 42501 persiste
1. Vérifier que les politiques RLS ont été appliquées
2. Vérifier que l'utilisateur est bien authentifié
3. Vérifier les logs de la base de données

### Si la création échoue toujours
1. Vérifier les contraintes de la base de données
2. Vérifier que les tables existent et ont la bonne structure
3. Exécuter le script de test pour diagnostiquer

## 📞 Support

En cas de problème persistant :
1. Vérifier les logs de l'application
2. Vérifier les logs de la base de données
3. Exécuter le script de test pour identifier le problème
4. Consulter la documentation Supabase sur RLS et les fonctions SQL

---

**Note** : Cette migration corrige les problèmes de cohérence de schéma et de permissions qui empêchaient la création d'organisations. Assurez-vous de tester en profondeur avant de déployer en production.
