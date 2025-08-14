# 🔧 Configuration de l'Edge Function setup-super-admin

## 📋 Variables d'Environnement Requises

Dans le Dashboard Supabase > Settings > Edge Functions, configurez ces variables :

### 1. SUPABASE_URL
```
https://metssugfqsnttghfrsxx.supabase.co
```

### 2. SUPABASE_SERVICE_ROLE_KEY
```
votre_clé_service_role_ici
```

**⚠️ IMPORTANT** : La clé service role peut être trouvée dans :
- Dashboard Supabase > Settings > API > Project API keys > **service_role**

## 🔒 Sécurité

- **NE JAMAIS** exposer la clé service role dans le code client
- **NE JAMAIS** commiter la clé service role dans Git
- Utiliser **UNIQUEMENT** dans l'Edge Function côté serveur

## 🧪 Test de Configuration

Après avoir configuré les variables, testez avec :

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

## ✅ Vérification

Si la configuration est correcte, vous devriez voir :
- Status 200 OK
- Réponse JSON avec `success: true`
- Utilisateur créé dans `auth.users`
- Entrée créée dans `super_admins`
