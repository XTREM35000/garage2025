# 🔍 Diagnostic de la Table Users

## 🚨 Problème identifié

L'erreur `Could not find the 'auth_user_id' column of 'users' in the schema cache` indique que la colonne `auth_user_id` n'existe pas dans la table `users`.

## 🔧 Étapes de diagnostic

### 1. **Exécuter le script de diagnostic**

Copiez et exécutez ce script dans le **SQL Editor de Supabase** :

```sql
-- Vérifier la structure exacte de la table users
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

### 2. **Analyser les résultats**

Vous devriez voir quelque chose comme :
```
column_name     | data_type | is_nullable | column_default
----------------|-----------|-------------|----------------
id              | uuid      | NO          | gen_random_uuid()
email           | text      | NO          | 
full_name       | text      | YES         | 
role            | text      | YES         | 
organisation_id | uuid      | YES         | 
is_active       | boolean   | YES         | true
created_at      | timestamp | YES         | now()
```

## 🎯 Solutions possibles

### **Solution 1 : Colonne `id` (Recommandée)**

Si la table a une colonne `id` :
```typescript
const userData = {
  id: user.id,  // ✅ Utiliser 'id'
  full_name: orgData.adminName,
  email: orgData.adminEmail,
  // ...
};
```

### **Solution 2 : Colonne `user_id`**

Si la table a une colonne `user_id` :
```typescript
const userData = {
  user_id: user.id,  // ✅ Utiliser 'user_id'
  full_name: orgData.adminName,
  email: orgData.adminEmail,
  // ...
};
```

### **Solution 3 : Pas de colonne ID**

Si la table n'a pas de colonne pour l'ID utilisateur :
```typescript
const userData = {
  // ❌ Ne pas inclure d'ID
  full_name: orgData.adminName,
  email: orgData.adminEmail,
  // ...
};
```

## 🛠️ Correction automatique

La fonction a été modifiée pour essayer automatiquement la colonne `id`. Si cela ne fonctionne toujours pas, nous devrons ajuster selon la structure réelle de votre table.

## 📋 Prochaines étapes

1. **Exécutez le script de diagnostic** dans Supabase
2. **Partagez les résultats** de la structure de la table
3. **Nous ajusterons** la fonction selon la structure réelle

## 🚨 Si la table n'existe pas

Si la table `users` n'existe pas, créez-la :

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  organisation_id UUID REFERENCES organisations(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);
```

Partagez les résultats du diagnostic pour que nous puissions corriger la fonction ! 🔧
