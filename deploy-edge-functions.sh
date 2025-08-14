#!/bin/bash

# Script de déploiement des Edge Functions Supabase
# Assurez-vous d'avoir installé Supabase CLI et d'être connecté

echo "🚀 Déploiement des Edge Functions Supabase..."

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé. Installez-le avec: npm install -g supabase"
    exit 1
fi

# Vérifier que l'utilisateur est connecté
if ! supabase status &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à Supabase. Connectez-vous avec: supabase login"
    exit 1
fi

# Déployer la fonction setup-super-admin
echo "📦 Déploiement de setup-super-admin..."
supabase functions deploy setup-super-admin

if [ $? -eq 0 ]; then
    echo "✅ setup-super-admin déployé avec succès!"
else
    echo "❌ Erreur lors du déploiement de setup-super-admin"
    exit 1
fi

# Déployer les autres fonctions si elles existent
if [ -d "supabase/functions/create-admin" ]; then
    echo "📦 Déploiement de create-admin..."
    supabase functions deploy create-admin
fi

if [ -d "supabase/functions/generate-report" ]; then
    echo "📦 Déploiement de generate-report..."
    supabase functions deploy generate-report
fi

if [ -d "supabase/functions/notify-stock-alert" ]; then
    echo "📦 Déploiement de notify-stock-alert..."
    supabase functions deploy notify-stock-alert
fi

echo "🎉 Toutes les Edge Functions ont été déployées avec succès!"
echo "🔗 URL de setup-super-admin: https://metssugfqsnttghfrsxx.supabase.co/functions/v1/setup-super-admin"
