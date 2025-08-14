# Implémentation du Layout Authentifié

## Vue d'ensemble

Ce document décrit l'implémentation d'un nouveau layout qui utilise les composants `Header.tsx` et `Footer.tsx` existants pour envelopper les pages après l'authentification.

## Composants utilisés

### 1. AuthenticatedLayout.tsx
- **Emplacement** : `src/layout/AuthenticatedLayout.tsx`
- **Fonction** : Layout principal qui enveloppe les pages authentifiées
- **Fonctionnalités** :
  - Vérifie si l'utilisateur est authentifié
  - Affiche le Header et Footer seulement si authentifié
  - Gère l'affichage conditionnel des composants

### 2. Header.tsx
- **Emplacement** : `src/components/Header.tsx`
- **Fonction** : En-tête de l'application avec navigation et informations utilisateur
- **Fonctionnalités** :
  - Logo animé avec icônes
  - Informations du garage
  - Menu utilisateur avec déconnexion
  - Indicateurs de statut système
  - Notifications

### 3. Footer.tsx
- **Emplacement** : `src/components/Footer.tsx`
- **Fonction** : Pied de page de l'application
- **Fonctionnalités** :
  - Copyright et informations légales
  - Liens vers mentions légales et contact
  - Design responsive

## Intégration dans App.tsx

Le layout a été intégré dans `src/App.tsx` en enveloppant toutes les routes protégées :

```tsx
<Route
  path="/dashboard"
  element={
    <WorkflowGuard>
      <SimpleAuthGuard>
        <PostAuthHandler>
          <AuthenticatedLayout>
            <Dashboard />
          </AuthenticatedLayout>
        </PostAuthHandler>
      </SimpleAuthGuard>
    </WorkflowGuard>
  }
/>
```

## Workflow d'authentification

1. **WorkflowGuard** : Vérifie l'état global du système
2. **SimpleAuthGuard** : Vérifie l'authentification de l'utilisateur
3. **PostAuthHandler** : Gère les actions post-authentification
4. **AuthenticatedLayout** : Applique le layout avec Header/Footer
5. **Page** : Contenu de la page

## Avantages

- **Séparation des responsabilités** : Layout distinct pour les pages authentifiées
- **Réutilisabilité** : Composants Header et Footer réutilisables
- **Maintenabilité** : Code organisé et modulaire
- **Cohérence** : Interface uniforme sur toutes les pages authentifiées

## Utilisation

Pour ajouter une nouvelle page authentifiée :

1. Créer la page dans `src/pages/`
2. Ajouter la route dans `src/App.tsx`
3. Envelopper la page avec `AuthenticatedLayout`

Exemple :
```tsx
<Route
  path="/nouvelle-page"
  element={
    <WorkflowGuard>
      <SimpleAuthGuard>
        <PostAuthHandler>
          <AuthenticatedLayout>
            <NouvellePage />
          </AuthenticatedLayout>
        </PostAuthHandler>
      </SimpleAuthGuard>
    </WorkflowGuard>
  }
/>
```

## Personnalisation

Le layout peut être personnalisé en passant des props :

```tsx
<AuthenticatedLayout showHeader={false} showFooter={true}>
  <MaPage />
</AuthenticatedLayout>
```

- `showHeader` : Affiche/masque le header (défaut: true)
- `showFooter` : Affiche/masque le footer (défaut: true)
