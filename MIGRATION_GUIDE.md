# Guide de Migration - Création d'Organisations

## 🚀 Migration vers la nouvelle fonction RPC

### ✅ Ce qui a été fait :

1. **Fonction RPC créée** : `create_organisation_with_admin` dans Supabase
2. **Fonctions utilitaires ajoutées** : `generateOrgCode`, `generateSlug`, `generateTempPassword`
3. **Nouvelle fonction JavaScript** : `createOrganizationWithAdmin`

### 🔄 Changements à faire dans votre code :

#### 1. Remplacer l'import

```typescript
// AVANT
import { createOrganizationWithEdge } from '@/integrations/supabase/client';

// APRÈS
import { createOrganizationWithAdmin } from '@/integrations/supabase/client';
```

#### 2. Remplacer l'appel de fonction

```typescript
// AVANT
const result = await createOrganizationWithEdge({
  name: formData.orgName,
  code: generateOrgCode(),
  slug: generateSlug(formData.orgName),
  email: formData.adminEmail,
  subscription_type: formData.plan
});

// APRÈS
const result = await createOrganizationWithAdmin({
  name: formData.orgName,
  adminEmail: formData.adminEmail,
  adminName: formData.adminName,
  plan: formData.plan
});
```

#### 3. Gérer le nouveau format de réponse

```typescript
// AVANT
console.log('Organisation créée:', result);

// APRÈS
console.log('Organisation créée:', result.organisation);
console.log('Admin créé:', result.admin);
console.log('Mot de passe temporaire:', result.tempPassword);

// Afficher le mot de passe à l'utilisateur
alert(`Organisation créée avec succès !\nMot de passe temporaire: ${result.tempPassword}`);
```

### 📁 Fichiers à mettre à jour :

1. **`InitializationWizard.tsx`** - Utiliser le nouveau composant fourni
2. **Tous les composants** qui utilisent `createOrganizationWithEdge`
3. **Tests** - Mettre à jour les tests pour utiliser la nouvelle fonction

### 🧪 Test de la migration :

```typescript
// Test rapide dans la console
import { createOrganizationWithAdmin } from '@/integrations/supabase/client';

const testResult = await createOrganizationWithAdmin({
  name: 'Test Organisation',
  adminEmail: 'test@example.com',
  adminName: 'Test Admin',
  plan: 'free'
});

console.log('Test réussi:', testResult);
```

### 🔧 Avantages de la nouvelle approche :

- ✅ **Transaction complète** : Organisation + Admin + Relations en une seule opération
- ✅ **Données structurées** : Plus facile à maintenir
- ✅ **Sécurité** : La fonction s'exécute avec les privilèges du créateur
- ✅ **Retour complet** : Vous obtenez toutes les données créées
- ✅ **Gestion d'erreurs** : Logs détaillés et gestion d'erreurs robuste

### 🚨 Points d'attention :

1. **Mot de passe temporaire** : Il doit être affiché à l'utilisateur
2. **Gestion d'erreurs** : La nouvelle fonction peut retourner des erreurs différentes
3. **Types TypeScript** : Mettre à jour les interfaces si nécessaire

### 📞 Support :

Si vous rencontrez des problèmes :
1. Vérifiez que la fonction RPC existe dans Supabase
2. Testez avec la fonction de test fournie
3. Vérifiez les logs de la console pour les erreurs détaillées
