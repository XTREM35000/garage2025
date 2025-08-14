# Correction du Problème de Colonne Database

## Problème Identifié

L'erreur suivante s'affichait lors de la création d'organisation :
```
"Erreur lors de la création null value in column "nom" of relation "organisations" violateds not-null constraint"
```

## Cause du Problème

Il y avait une incohérence entre :
1. **Le schéma TypeScript** : qui définissait la colonne comme `name`
2. **La base de données réelle** : qui utilise encore l'ancienne colonne `nom`

## Solution Appliquée

### 1. Correction dans InitializationWizard.tsx
```typescript
// AVANT
.insert({
  name: orgAdminData.organisationName,
  // ...
})

// APRÈS  
.insert({
  nom: orgAdminData.organisationName, // Utiliser 'nom' au lieu de 'name'
  // ...
})
```

### 2. Correction dans client.ts
```typescript
// AVANT
.select('id, name, code, description, created_at')
.order('name')

// APRÈS
.select('id, nom, code, description, created_at')
.order('nom')
```

### 3. Correction dans checkUserPermissions()
```typescript
// AVANT
organisations!inner(
  id,
  name,
  code,
  description
)

// APRÈS
organisations!inner(
  id,
  nom,
  code,
  description
)
```

## Vérification

Après ces corrections :
- ✅ La création d'organisation devrait fonctionner
- ✅ Les requêtes d'organisations devraient fonctionner
- ✅ Plus d'erreur 400 sur les appels API

## Note Importante

Le schéma TypeScript dans `types.ts` montre encore `name` mais la base de données utilise `nom`. 
Pour une solution complète, il faudrait soit :
1. Mettre à jour la base de données pour utiliser `name`
2. Ou mettre à jour le schéma TypeScript pour utiliser `nom`

Pour l'instant, le code a été corrigé pour correspondre à la base de données existante. 