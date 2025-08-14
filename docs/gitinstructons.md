# Procédure de synchronisation Git & Initialisation Multi-Instances

## 1. Synchronisation du dépôt local avec le dépôt distant

### a. Vérification de l'état du dépôt
```bash
git status
```
- Vérifie les fichiers modifiés, ajoutés ou supprimés.

### b. Ajout des fichiers au staging
```bash
git add .
```
- Ajoute tous les fichiers modifiés et nouveaux au staging area.

### c. Commit des modifications
```bash
git commit -m "feat: refonte initialisation multi-instances + synchro"
```
- Crée un commit avec un message explicite.

### d. Récupération des dernières modifications distantes
```bash
git fetch origin
```
- Récupère les dernières modifications du dépôt distant sans les fusionner.

### e. Fusion avec la branche distante (gestion des conflits)
```bash
git pull origin main
```
- Fusionne la branche distante `main` avec la branche locale.
- **En cas de conflit** :
  - Ouvrir les fichiers en conflit, corriger manuellement.
  - Après résolution :
    ```bash
    git add <fichier_conflit>
    git commit -m "fix: résolution des conflits de fusion"
    ```

### f. Pousser les modifications locales vers le dépôt distant
```bash
git push origin main
```
- Envoie les commits locaux sur la branche distante.

---

## 2. Nouveau workflow d'initialisation multi-instances (application)

### a. Vérification Super-Admin
- Au premier lancement, l'application vérifie si la table `super_admins` est vide (via Supabase).
- Si vide : une modal de création Super-Admin (bloquante) s'affiche. L'utilisateur doit créer le compte Super-Admin pour continuer.

### b. Vérification Organisation
- Si un Super-Admin existe mais aucune organisation n'est présente :
  - Affichage d'un sélecteur de plan (Gratuit/Mensuel/À VIE).
  - Après choix du plan, affichage de la modal de création d'organisation (CRUD) puis de l'admin d'organisation.

### c. Authentification
- Si les étapes précédentes sont validées mais qu'aucun cookie d'auth n'est présent :
  - Redirection vers `/auth` avec double onglet Connexion/Inscription.
  - Le formulaire d'inscription inclut : select d'organisation, upload avatar, design WhatsApp-like, dark/light toggle.

### d. Après authentification
- Redirection automatique vers `/` ou `/dashboard`.
- L'état de l'application est garanti cohérent et linéaire (aucune étape ne peut être sautée).

### e. Contraintes techniques
- Utilisation des composants existants (modals, forms, select, etc.).
- Optimisation des requêtes Supabase.
- Transitions fluides entre les étapes.
- Thème toggleable (clair/sombre, style WhatsApp).

---

**Remarque :**
- En cas de problème ou de conflit git, toujours vérifier l'état avec `git status` et demander de l'aide si besoin.
- Ce guide est à conserver et à suivre pour toute future synchronisation ou refonte du workflow d'initialisation.
