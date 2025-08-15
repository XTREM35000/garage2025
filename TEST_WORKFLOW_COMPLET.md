# 🧪 Test du Workflow Complet - Garage 2025

## 🎯 Objectif du Test

Vérifier que le workflow d'initialisation fonctionne correctement dans l'ordre suivant :
1. **Super Admin** → Création du premier super admin
2. **Pricing Plan** → Sélection du plan tarifaire
3. **Admin Creation** → Création de l'administrateur (sans connexion)
4. **Admin Login** → Connexion de l'administrateur créé
5. **Organization** → Création de l'organisation du tenant
6. **SMS Validation** → Validation par SMS
7. **Garage Setup** → Configuration du garage
8. **Dashboard** → Accès au dashboard Admin/Tenant

## 🚀 Étapes de Test

### Phase 1 : Préparation
- [ ] **Base de données** : Exécuter `fix_profiles_permissions.sql`
- [ ] **Application** : Redémarrer après modifications
- [ ] **Console** : Ouvrir pour surveiller les logs

### Phase 2 : Test Super Admin
- [ ] **SplashScreen** se charge à 100%
- [ ] **Formulaire Super Admin** s'affiche automatiquement
- [ ] **Création** du premier super admin
- [ ] **Transition** vers l'étape Pricing Plan

### Phase 3 : Test Pricing Plan
- [ ] **Modal Pricing** s'affiche avec design WhatsApp
- [ ] **3 plans** affichés (Gratuit, Mensuel, Annuel)
- [ **Plan "Mensuel"** marqué comme populaire
- [ ] **Sélection** d'un plan fonctionne
- [ ] **Transition** vers l'étape Admin Creation

### Phase 4 : Test Admin Creation
- [ ] **Modal Admin** s'affiche avec design WhatsApp
- [ ] **Création** de l'administrateur sans connexion
- [ ] **Ajout** dans `auth.users` et `public.profiles`
- [ ] **Redirection** vers la page de connexion

### Phase 5 : Test Admin Login
- [ ] **Page de connexion** s'affiche
- [ ] **Connexion** avec l'admin créé
- [ ] **Transition** vers l'étape Organization

### Phase 6 : Test Organization
- [ ] **Modal Organization** s'affiche avec design WhatsApp
- [ ] **Création** de l'organisation avec le plan sélectionné
- [ ] **Transition** vers l'étape SMS Validation

### Phase 7 : Test SMS Validation
- [ ] **Modal SMS** s'affiche avec design WhatsApp
- [ ] **Processus** de validation fonctionnel
- [ ] **Transition** vers l'étape Garage Setup

### Phase 8 : Test Garage Setup
- [ ] **Modal Garage** s'affiche avec design WhatsApp
- [ ] **Configuration** complète du garage
- [ ] **Finalisation** du workflow

### Phase 9 : Test Dashboard
- [ ] **Dashboard Admin** s'affiche
- [ ] **Interface complète** accessible
- [ ] **Fonctionnalités admin** disponibles

## 🔍 Vérifications Techniques

### 1. Console du Navigateur
```bash
# Logs attendus dans l'ordre :
🔍 Vérification du workflow...
👑 Super admin existe: false
⚠️ Pas de super admin -> Étape SUPER_ADMIN (initialisation)
🎯 Étape terminée: super-admin
🔄 Passage à l'étape suivante: pricing
🎯 Étape terminée: pricing
🔄 Passage à l'étape suivante: create-admin
🎯 Étape terminée: create-admin
🔐 Authentification requise après création admin
```

### 2. Base de Données
```sql
-- Vérifier la progression dans onboarding_workflow_states
SELECT current_step, created_at, updated_at 
FROM onboarding_workflow_states 
ORDER BY created_at DESC;

-- Vérifier les profils créés
SELECT id, email, role, nom FROM profiles ORDER BY created_at;

-- Vérifier les super admins
SELECT * FROM super_admins;
```

### 3. Tables Créées
- [ ] **`auth.users`** : Utilisateurs créés
- [ ] **`public.profiles`** : Profils avec rôles
- [ ] **`public.super_admins`** : Super admin enregistré
- [ ] **`public.organisations`** : Organisation créée
- [ ] **`public.user_organizations`** : Relations utilisateur-organisation

## 🚨 Points de Contrôle Critiques

### 1. Fonction `create_profile_bypass_rls`
```sql
-- Vérifier que la fonction existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_profile_bypass_rls';
```

### 2. Permissions RLS
```sql
-- Vérifier les politiques sur profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

### 3. Workflow States
```sql
-- Vérifier la progression des étapes
SELECT current_step, COUNT(*) 
FROM onboarding_workflow_states 
GROUP BY current_step;
```

## 🧪 Scénarios de Test

### Scénario A : Workflow Complet Réussi
1. **Super Admin** → Créé avec succès
2. **Pricing** → Plan sélectionné
3. **Admin** → Créé et connecté
4. **Organization** → Créée avec succès
5. **SMS** → Validé
6. **Garage** → Configuré
7. **Dashboard** → Accessible

### Scénario B : Erreur de Permissions
1. **Erreur 404** sur `create_profile_bypass_rls`
2. **Solution** : Exécuter le script SQL
3. **Retest** du workflow

### Scénario C : Erreur de Workflow
1. **Boucle infinie** de vérification
2. **Solution** : Vérifier la logique de progression
3. **Retest** du workflow

## 📋 Checklist de Validation

### Design WhatsApp
- [ ] **Modales** avec design WhatsApp vert
- [ ] **Formulaires** avec styles cohérents
- [ ] **Boutons** avec couleurs WhatsApp
- [ ] **Responsive** sur mobile et desktop

### Workflow Technique
- [ ] **Progression** automatique entre étapes
- [ ] **Gestion d'erreurs** appropriée
- [ ] **Base de données** mise à jour correctement
- [ ] **Permissions RLS** respectées

### Expérience Utilisateur
- [ ] **Transitions fluides** entre étapes
- [ ] **Feedback visuel** constant
- [ ] **Gestion des erreurs** claire
- [ ] **Navigation intuitive**

## 🚀 Démarrage du Test

### 1. Préparation
```bash
# Redémarrer l'application
npm run dev

# Vérifier la console pour les erreurs
# S'assurer que fix_profiles_permissions.sql a été exécuté
```

### 2. Test du Workflow
1. **Ouvrir** l'application dans le navigateur
2. **Attendre** le SplashScreen à 100%
3. **Vérifier** que le formulaire Super Admin s'affiche
4. **Suivre** chaque étape du workflow
5. **Documenter** les erreurs rencontrées

### 3. Validation
1. **Vérifier** la console pour les logs
2. **Contrôler** la base de données
3. **Tester** l'accès au dashboard final
4. **Valider** le design WhatsApp

## 🎯 Critères de Succès

- ✅ **Workflow complet** fonctionne sans erreur
- ✅ **Design WhatsApp** appliqué partout
- ✅ **Base de données** mise à jour correctement
- ✅ **Permissions RLS** respectées
- ✅ **Dashboard Admin** accessible
- ✅ **Interface responsive** et moderne

---

**Objectif** : Vérifier que l'implémentation du workflow complet et du design WhatsApp permet une expérience utilisateur exceptionnelle tout en maintenant la fonctionnalité technique.
