# Configuration des Variables d'Environnement

## Problème détecté
L'application affiche des avertissements concernant les clés Supabase manquantes et des erreurs 400 lors des appels API.

## Solution

### 1. Créer le fichier .env.local

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```bash
# Supabase Configuration
VITE_PUBLIC_SUPABASE_URL=https://metssugfqsnttghfrsxx.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_ici
VITE_PUBLIC_SUPABASE_SERVICE_KEY=votre_clé_service_ici

# Debug Mode (optionnel)
VITE_DEBUG=false
```

### 2. Obtenir vos clés Supabase

1. Connectez-vous à votre projet Supabase
2. Allez dans Settings > API
3. Copiez :
   - **Project URL** → `VITE_PUBLIC_SUPABASE_URL`
   - **anon public** → `VITE_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `VITE_PUBLIC_SUPABASE_SERVICE_KEY`

### 3. Redémarrer l'application

Après avoir créé le fichier `.env.local`, redémarrez votre serveur de développement :

```bash
npm run dev
# ou
yarn dev
```

## Vérification

Après la configuration, vous devriez voir :
- ✅ Supabase connecté avec session (si connecté)
- ℹ️ Supabase initialisé - aucune session active (si non connecté)
- Plus d'erreurs 400 sur les appels API

## Notes importantes

- Le fichier `.env.local` ne doit pas être commité dans Git
- Les clés Supabase sont sensibles, gardez-les secrètes
- L'URL par défaut est déjà configurée pour votre projet
