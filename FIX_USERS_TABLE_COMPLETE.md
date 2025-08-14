# 🔧 Correction Complète de la Table Users

## ✅ Diagnostic terminé

Votre table `users` a cette structure actuelle :
```sql
id              | uuid      | NO  | gen_random_uuid()
email           | varchar   | NO  | 
password_hash   | text      | NO  | 
created_at      | timestamp | YES | now()
```

## 🚨 Problème identifié

La table `users` manque les colonnes nécessaires :
- ❌ `full_name`
- ❌ `role` 
- ❌ `organisation_id`
- ❌ `is_active`

## 🔧 Solution : Ajouter les colonnes manquantes

### **Étape 1 : Exécuter le script SQL**

Copiez et exécutez ce script dans le **SQL Editor de Supabase** :

```sql
-- Ajouter les colonnes manquantes à la table users
ALTER TABLE users ADD COLUMN full_name TEXT;
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN organisation_id UUID REFERENCES organisations(id);
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Vérifier la nouvelle structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
```

### **Étape 2 : Vérifier les résultats**

Après l'exécution, vous devriez voir :
```sql
id              | uuid      | NO  | gen_random_uuid()
email           | varchar   | NO  | 
password_hash   | text      | NO  | 
created_at      | timestamp | YES | now()
full_name       | text      | YES | 
role            | text      | YES | user
organisation_id | uuid      | YES | 
is_active       | boolean   | YES | true
```

## 🛠️ Améliorations de la fonction

La fonction `createOrganizationWithAdmin` a été améliorée pour :

### ✅ **Gestion des utilisateurs existants**
- Vérifie si l'utilisateur existe déjà
- Met à jour les informations si nécessaire
- Crée un nouvel utilisateur si nécessaire

### ✅ **Gestion d'erreur améliorée**
- Gère les erreurs de vérification
- Logs détaillés pour le débogage

## 🧪 Test de la correction

### **1. Exécutez le script SQL**
- Ajoutez les colonnes manquantes

### **2. Testez le workflow**
- Super Admin → Pricing → Admin → Organisation → Garage

### **3. Vérifiez les logs**
```
✅ Utilisateur admin trouvé: {...}
✅ Création d'un nouvel utilisateur... (ou mise à jour)
✅ Organisation créée: {...}
✅ Configuration du garage terminée!
```

## 🎯 Résultat attendu

- ✅ **Plus d'erreur de colonne manquante**
- ✅ **Création d'organisation réussie**
- ✅ **Workflow complet fonctionnel**
- ✅ **Gestion des utilisateurs existants**

## 🚨 Si problèmes persistants

### **Erreur de contrainte de clé étrangère**
- Vérifiez que la table `organisations` existe
- Vérifiez que l'organisation a bien un `id` valide

### **Erreur de permissions**
- Vérifiez les politiques RLS sur la table `users`
- Vérifiez les permissions d'insertion/mise à jour

### **Erreur de type de données**
- Vérifiez que les types correspondent (UUID, TEXT, etc.)

## 🎉 Prochaines étapes

1. **Exécutez le script SQL** pour ajouter les colonnes
2. **Testez le workflow** complet
3. **Vérifiez que tout fonctionne** correctement

Le workflow devrait maintenant fonctionner parfaitement ! 🚀
