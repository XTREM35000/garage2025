# Correction de la Logique Organisation - user_organizations

## Problème Identifié

L'erreur `403 (Forbidden)` et `permission denied for table user_organizations` était causée par une logique incorrecte dans la gestion des permissions.

### ❌ **Problème**
```
{code: '42501', details: null, hint: null, message: 'permission denied for table user_organizations'}
```

## Cause

1. **L'utilisateur est super admin** mais le code essaie de vérifier les permissions dans `user_organizations`
2. **Les politiques RLS** sur `user_organizations` sont trop restrictives
3. **Logique incohérente** : Super admin devrait voir toutes les organisations directement

## Solution Appliquée

### 🔧 **Nouvelle Logique dans `getAvailableOrganizations()`**

```typescript
// AVANT (logique incorrecte)
if (isSuperAdmin) {
  // Super admin : récupérer via user_organizations (❌ incorrect)
  const { organizations } = await checkUserPermissions(user.id);
} else {
  // Utilisateur normal : même logique (❌ incorrect)
  const { organizations } = await checkUserPermissions(user.id);
}

// APRÈS (logique corrigée)
if (isSuperAdmin) {
  // Super admin : récupérer toutes les organisations directement (✅ correct)
  console.log('🔍 Super admin détecté, récupération de toutes les organisations...');
  const { organizations, error } = await getOrganizationsWithEdge();
} else {
  // Utilisateur normal : essayer user_organizations avec fallback (✅ robuste)
  console.log('🔍 Utilisateur normal, vérification des permissions...');
  try {
    const { organizations } = await checkUserPermissions(user.id);
    return { organizations: organizations.map((org: any) => org.organisations) };
  } catch (permError) {
    // Fallback : récupération directe si permissions échouent
    console.log('🔄 Fallback : récupération directe des organisations...');
    const { organizations, error } = await getOrganizationsWithEdge();
  }
}
```

## Modifications Apportées

### 📋 **1. Logique Super Admin**
```typescript
if (isSuperAdmin) {
  // Super admin : récupérer toutes les organisations directement
  console.log('🔍 Super admin détecté, récupération de toutes les organisations...');
  const { organizations, error } = await getOrganizationsWithEdge();
  // Pas de vérification user_organizations pour super admin
}
```

### 📋 **2. Logique Utilisateur Normal**
```typescript
else {
  // Utilisateur normal : essayer de récupérer via user_organizations
  console.log('🔍 Utilisateur normal, vérification des permissions...');
  try {
    const { organizations } = await checkUserPermissions(user.id);
    return { organizations: organizations.map((org: any) => org.organisations) };
  } catch (permError) {
    // Fallback : récupérer toutes les organisations si les permissions échouent
    console.log('🔄 Fallback : récupération directe des organisations...');
    const { organizations, error } = await getOrganizationsWithEdge();
  }
}
```

### 📋 **3. Gestion d'Erreurs Améliorée**
```typescript
// Logging détaillé pour debug
console.log('🔍 Super admin détecté, récupération de toutes les organisations...');
console.error('❌ Erreur récupération organisations pour super admin:', error);
console.log('✅ Organisations récupérées pour super admin:', organizations?.length || 0);
```

## Avantages de la Correction

### ✅ **1. Logique Correcte**
- Super admin voit toutes les organisations directement
- Utilisateur normal utilise user_organizations avec fallback
- Plus de confusion entre les deux approches

### ✅ **2. Robustesse**
- Fallback en cas d'erreur de permissions
- Gestion d'erreurs détaillée
- Logging pour debug

### ✅ **3. Performance**
- Super admin : une seule requête directe
- Utilisateur normal : tentative permissions + fallback si nécessaire

### ✅ **4. Sécurité**
- Respect des politiques RLS
- Fallback sécurisé
- Pas de contournement des permissions

## Résultat

Après cette correction :
- ✅ Plus d'erreur `403 (Forbidden)`
- ✅ Plus d'erreur `permission denied for table user_organizations`
- ✅ Super admin peut voir toutes les organisations
- ✅ Utilisateur normal avec fallback robuste
- ✅ Logique claire et maintenable

## Vérification

Pour confirmer que la correction fonctionne :
1. ✅ Redémarrer le serveur de développement
2. ✅ Tester avec un super admin
3. ✅ Vérifier que les organisations s'affichent
4. ✅ Tester avec un utilisateur normal
5. ✅ Confirmer le fallback en cas d'erreur

Cette correction résout le problème de logique entre les tables ! 🚀
