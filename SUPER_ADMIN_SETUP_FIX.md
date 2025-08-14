# 🔧 Résolution du Problème RLS Super-Admin

## 🚨 Problème Identifié

L'erreur `infinite recursion detected in policy for relation "super_admins"` indique que les politiques RLS (Row Level Security) de Supabase créent une récursion infinie lors de la création du premier super-admin.

## 🎯 Cause du Problème

Les politiques RLS essaient de vérifier si l'utilisateur est super-admin pour lui permettre d'insérer dans la table `super_admins`, ce qui crée une récursion infinie :
1. L'utilisateur essaie d'insérer dans `super_admins`
2. RLS vérifie si l'utilisateur est super-admin
3. Pour vérifier cela, il faut lire la table `super_admins`
4. Mais l'utilisateur n'est pas encore super-admin
5. Boucle infinie...

## ✅ Solution Implémentée

### 1. Edge Function avec Service Role

Nous utilisons une Edge Function (`setup-super-admin`) qui :
- Utilise le **service role** de Supabase (contourne RLS)
- Gère la création d'utilisateur et l'insertion dans `super_admins`
- Évite complètement les problèmes de récursion RLS

### 2. Modification du Composant

Le composant `SuperAdminSetupModal` appelle maintenant l'Edge Function au lieu d'utiliser directement Supabase.

## 🚀 Déploiement

### Prérequis

1. **Installer Supabase CLI :**
```bash
npm install -g supabase
```

2. **Se connecter à Supabase :**
```bash
supabase login
```

3. **Lier le projet :**
```bash
supabase link --project-ref metssugfqsnttghfrsxx
```

### Déploiement Automatique

```bash
# Rendre le script exécutable
chmod +x deploy-edge-functions.sh

# Déployer
./deploy-edge-functions.sh
```

### Déploiement Manuel

```bash
supabase functions deploy setup-super-admin
```

## 🔧 Configuration

### Variables d'Environnement

Assurez-vous que ces variables sont définies dans votre projet Supabase :

```env
SUPABASE_URL=https://metssugfqsnttghfrsxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
```

### URL de l'Edge Function

Après déploiement, l'URL sera :
```
https://metssugfqsnttghfrsxx.supabase.co/functions/v1/setup-super-admin
```

## 🧪 Test

### 1. Test de l'Edge Function

```bash
curl -X POST 'https://metssugfqsnttghfrsxx.supabase.co/functions/v1/setup-super-admin' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "phone": "+225 0701234567",
    "nom": "Test",
    "prenom": "User"
  }'
```

### 2. Test via l'Interface

1. Ouvrir l'application
2. Aller à la configuration Super-Admin
3. Remplir le formulaire
4. Vérifier que la création fonctionne

## 🔍 Vérification

### Dans Supabase Dashboard

1. **Table `super_admins` :** Vérifier que l'utilisateur a été créé
2. **Table `auth.users` :** Vérifier que l'utilisateur existe
3. **Table `user_organizations` :** Vérifier la relation avec l'organisation

### Logs de l'Edge Function

Dans Supabase Dashboard > Edge Functions > Logs, vous devriez voir :
```
🏗️ Configuration Super-Admin: { email: "test@example.com", nom: "Test", prenom: "User" }
✅ Nouveau compte créé: test@example.com
✅ Super-Admin configuré avec succès: [user-id]
```

## 🚨 Dépannage

### Erreur "Function not found"

```bash
# Redéployer la fonction
supabase functions deploy setup-super-admin
```

### Erreur "Service role key not found"

1. Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est définie
2. Redéployer la fonction après correction

### Erreur "Permission denied"

1. Vérifier que la clé service role a les bonnes permissions
2. Vérifier que RLS est correctement configuré

## 📚 Ressources

- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Guide RLS Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Service Role vs Anon Key](https://supabase.com/docs/guides/auth/row-level-security#service-role)

## 🎉 Résultat Attendu

Après cette solution :
- ✅ Plus d'erreur de récursion infinie
- ✅ Création du Super-Admin fonctionnelle
- ✅ Contournement propre des problèmes RLS
- ✅ Architecture sécurisée et maintenable
