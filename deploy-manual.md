# 🚀 Déploiement Manuel de l'Edge Function

## 📋 Prérequis

1. **Accès au Dashboard Supabase** : https://supabase.com/dashboard
2. **Projet** : garage-abidjan-dashboard (metssugfqsnttghfrsxx)

## 🔧 Étapes de Déploiement

### 1. Accéder au Dashboard Supabase

- Aller sur https://supabase.com/dashboard
- Se connecter avec votre compte
- Sélectionner le projet `garage-abidjan-dashboard`

### 2. Aller dans Edge Functions

- Dans le menu de gauche, cliquer sur **"Edge Functions"**
- Cliquer sur **"New Function"**

### 3. Créer la Fonction

- **Nom de la fonction** : `setup-super-admin`
- **Description** : `Setup Super Admin bypassing RLS`
- Cliquer sur **"Create Function"**

### 4. Copier le Code

- Remplacer le contenu par défaut par le code de `supabase/functions/setup-super-admin/index.ts`
- Cliquer sur **"Deploy"**

### 5. Vérifier le Déploiement

- La fonction devrait apparaître dans la liste
- L'URL sera : `https://metssugfqsnttghfrsxx.supabase.co/functions/v1/setup-super-admin`

## 🧪 Test de la Fonction

### Via cURL
```bash
curl -X POST 'https://metssugfqsnttghfrsxx.supabase.co/functions/v1/setup-super-admin' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHNzdWdmcXNudHRnaGZyc3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDk5NjEsImV4cCI6MjA2ODQyNTk2MX0.Vc0yDgzSe6iAfgUHezVKQMm4qvzMRRjCIrTTndpE1k8' \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "phone": "+225 0701234567",
    "nom": "Test",
    "prenom": "User"
  }'
```

### Via l'Interface
1. Ouvrir l'application
2. Aller à la configuration Super-Admin
3. Remplir le formulaire
4. Vérifier que la création fonctionne

## 🔍 Vérification

### Dans Supabase Dashboard
1. **Table `super_admins`** : Vérifier que l'utilisateur a été créé
2. **Table `auth.users`** : Vérifier que l'utilisateur existe
3. **Table `user_organizations`** : Vérifier la relation avec l'organisation

### Logs de l'Edge Function
Dans Supabase Dashboard > Edge Functions > Logs, vous devriez voir :
```
🏗️ Configuration Super-Admin: { email: "test@example.com", nom: "Test", prenom: "User" }
✅ Nouveau compte créé: test@example.com
✅ Super-Admin configuré avec succès: [user-id]
```

## 🚨 Dépannage

### Erreur "Function not found"
- Vérifier que la fonction est bien déployée
- Vérifier l'URL dans l'interface

### Erreur "Service role key not found"
- Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est définie dans les variables d'environnement du projet

### Erreur "Permission denied"
- Vérifier que la clé service role a les bonnes permissions
- Vérifier que RLS est correctement configuré

## 🎉 Résultat Attendu

Après ce déploiement :
- ✅ Plus d'erreur de récursion infinie RLS
- ✅ Création du Super-Admin fonctionnelle
- ✅ Contournement propre des problèmes RLS
- ✅ Architecture sécurisée et maintenable
