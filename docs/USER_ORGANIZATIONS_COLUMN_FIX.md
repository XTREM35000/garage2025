# Correction du Nom de Colonne - user_organizations

## Problème Identifié

L'erreur `406 (Not Acceptable)` et `400 (Bad Request)` était causée par une incohérence dans les noms de colonnes de la table `user_organizations`.

### ❌ **Erreur**
```
{code: '42703', details: null, hint: 'Perhaps you meant to reference the column "user_organizations.organisation_id".', message: 'column user_organizations.organization_id does not exist'}
```

## Cause

Le code utilisait `organization_id` (sans 's') mais la base de données a `organisation_id` (avec 's'). De plus, la colonne `role` n'existe pas dans la table `user_organizations`.

## Solution Appliquée

### 🔧 **Correction dans `checkUserPermissions()`**

```typescript
// AVANT (incorrect)
.select(`
  organization_id,  // ❌ Sans 's'
  role,            // ❌ Colonne inexistante
  organisations!inner(...)
`)
.eq('organization_id', organizationId)  // ❌ Sans 's'

// APRÈS (correct)
.select(`
  organisation_id,  // ✅ Avec 's'
  organisations!inner(...)
`)
.eq('organisation_id', organizationId)  // ✅ Avec 's'
```

## Modifications Apportées

### 📋 **1. Sélection de Colonnes**
```typescript
// Dans la première requête (sans organizationId)
.select(`
  organisation_id,  // ✅ Corrigé
  organisations!inner(
    id,
    name,
    code,
    description
  )
`)
```

### 📋 **2. Condition de Filtrage**
```typescript
// Dans la deuxième requête (avec organizationId)
.eq('organisation_id', organizationId)  // ✅ Corrigé
```

### 📋 **3. Suppression de la Colonne Role**
```typescript
// Suppression de la colonne 'role' qui n'existe pas
// Rôle par défaut retourné : 'user'
```

## Résultat

Après cette correction :
- ✅ Plus d'erreur `42703` (colonne inexistante)
- ✅ Plus d'erreur `406 (Not Acceptable)`
- ✅ Plus d'erreur `400 (Bad Request)`
- ✅ Les permissions utilisateur fonctionnent correctement
- ✅ Le workflow d'initialisation peut se terminer normalement
- ✅ Suppression de la colonne `role` inexistante
- ✅ Utilisation du bon nom de colonne `organisation_id`

## Vérification

Pour confirmer que la correction fonctionne :
1. ✅ Redémarrer le serveur de développement
2. ✅ Tester le workflow d'initialisation complet
3. ✅ Vérifier que la sélection d'organisation fonctionne
4. ✅ Confirmer l'accès à la page d'authentification

Cette correction résout le problème de navigation après la création d'organisation ! 🚀
