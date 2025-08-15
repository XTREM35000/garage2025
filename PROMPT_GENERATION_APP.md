# Prompt pour générer une application de gestion multi-instances de garages

## Contexte du projet
Créer une application web React moderne avec Supabase comme backend pour gérer plusieurs instances de garages automobiles. L'application doit supporter une architecture multi-tenants où chaque garage est une organisation distincte.

## Architecture technique
- Frontend : React avec TypeScript
- Backend : Supabase (PostgreSQL + Authentication)
- UI : TailwindCSS
- State Management : React Context + Custom Hooks
- Routing : React Router

## Structure de la base de données Supabase

### Tables principales
```sql
-- Organisations (Garages)
create table organisations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  subscription_type text default 'free',
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Profils utilisateurs
create table profiles (
  id uuid primary key references auth.users,
  user_id uuid unique references auth.users,
  email text unique not null,
  full_name text,
  phone text,
  role text default 'user',
  organisation_id uuid references organisations,
  status boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- État du workflow d'onboarding
create table onboarding_workflow_states (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references organisations,
  current_step text not null,
  is_completed boolean default false,
  last_updated timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references auth.users,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

## Fonctionnalités clés

### 1. Workflow d'initialisation
- Création compte super admin
- Configuration initiale de l'organisation
- Sélection du plan d'abonnement
- Configuration du profil administrateur
- Validation et redirection vers le dashboard

### 2. Gestion des utilisateurs et rôles
- Super Admin : Gestion globale de toutes les instances
- Admin : Gestion d'une instance de garage
- Staff : Accès limité aux fonctionnalités du garage

### 3. Dashboard administrateur
- Vue d'ensemble des KPIs
- Gestion des employés
- Gestion des clients
- Gestion des véhicules
- Gestion des interventions
- Facturation

## Composants React principaux

### 1. Composants d'authentification
```typescript
// SuperAdminSetupModal.tsx
interface SuperAdminSetupModalProps {
  onComplete: () => void;
  isOpen: boolean;
}

// InitializationWizard.tsx
interface InitializationWizardProps {
  onComplete: () => void;
  initialStep?: string;
}

// WorkflowGuard.tsx
interface WorkflowGuardProps {
  children: React.ReactNode;
  requiredSteps?: string[];
}
```

### 2. Hooks personnalisés
```typescript
// useWorkflowState.ts
interface WorkflowState {
  currentStep: string;
  isCompleted: boolean;
  updateStep: (step: string) => Promise<void>;
  completeWorkflow: () => Promise<void>;
}

// useOrganization.ts
interface OrganizationContext {
  organization: Organization | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
}
```

### 3. Composants du tableau de bord
```typescript
// DashboardLayout.tsx
interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

// NavigationMenu.tsx
interface NavigationItem {
  label: string;
  path: string;
  icon: IconType;
  roles: string[];
}
```

## Flux de travail principal

1. **Inscription initiale**
   - Création du compte super admin
   - Configuration de l'organisation principale
   - Sélection du plan

2. **Configuration de l'organisation**
   - Informations du garage
   - Configuration des services
   - Invitation des employés

3. **Gestion quotidienne**
   - Tableau de bord avec KPIs
   - Gestion des rendez-vous
   - Suivi des interventions
   - Facturation

## Sécurité et permissions

### Règles RLS Supabase
```sql
-- Règles pour organisations
create policy "Organisations visibles par les utilisateurs connectés"
  on organisations for select
  using (auth.role() = 'authenticated');

-- Règles pour profiles
create policy "Les utilisateurs peuvent voir leur propre profil"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Les admins peuvent voir tous les profils de leur organisation"
  on profiles for select
  using (
    auth.uid() in (
      select p.user_id 
      from profiles p 
      where p.role = 'admin' 
      and p.organisation_id = organisation_id
    )
  );
```

## Instructions de déploiement

1. Configuration Supabase
   - Créer un nouveau projet
   - Configurer l'authentification
   - Exécuter les migrations SQL

2. Configuration React
   - Installation des dépendances
   - Configuration des variables d'environnement
   - Build et déploiement

3. Tests
   - Workflow d'onboarding
   - Gestion des permissions
   - CRUD des entités principales

## Extensions recommandées VS Code
- Supabase
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier

## Points d'attention particuliers
1. Gestion des états de chargement
2. Validation des formulaires
3. Gestion des erreurs
4. Optimisation des performances
5. Responsive design
6. Tests unitaires et d'intégration
