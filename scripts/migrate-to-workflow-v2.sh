#!/bin/bash

# Script de migration vers Workflow V2
# Ce script facilite le déploiement de la refactorisation complète du workflow

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups/workflow-v1-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$PROJECT_ROOT/logs/migration-$(date +%Y%m%d-%H%M%S).log"

# Fonctions utilitaires
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Vérifications préalables
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier que nous sommes dans le bon répertoire
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        error "Ce script doit être exécuté depuis la racine du projet"
    fi
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
    fi
    
    # Vérifier npm/yarn
    if ! command -v npm &> /dev/null && ! command -v yarn &> /dev/null; then
        error "Ni npm ni yarn ne sont installés"
    fi
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        error "Git n'est pas installé"
    fi
    
    success "Prérequis vérifiés"
}

# Créer les répertoires nécessaires
create_directories() {
    log "Création des répertoires nécessaires..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$PROJECT_ROOT/src/contexts"
    mkdir -p "$PROJECT_ROOT/src/utils"
    mkdir -p "$PROJECT_ROOT/src/tests"
    
    success "Répertoires créés"
}

# Sauvegarder la version actuelle
backup_current_version() {
    log "Sauvegarde de la version actuelle..."
    
    # Sauvegarder les composants existants
    if [[ -f "$PROJECT_ROOT/src/components/WorkflowGuard.tsx" ]]; then
        cp "$PROJECT_ROOT/src/components/WorkflowGuard.tsx" "$BACKUP_DIR/"
        log "WorkflowGuard.tsx sauvegardé"
    fi
    
    if [[ -f "$PROJECT_ROOT/src/components/InitializationWizard.tsx" ]]; then
        cp "$PROJECT_ROOT/src/components/InitializationWizard.tsx" "$BACKUP_DIR/"
        log "InitializationWizard.tsx sauvegardé"
    fi
    
    # Sauvegarder App.tsx
    cp "$PROJECT_ROOT/src/App.tsx" "$BACKUP_DIR/"
    log "App.tsx sauvegardé"
    
    # Sauvegarder les types
    if [[ -f "$PROJECT_ROOT/src/types/workflow.ts" ]]; then
        cp "$PROJECT_ROOT/src/types/workflow.ts" "$BACKUP_DIR/"
        log "workflow.ts sauvegardé"
    fi
    
    success "Version actuelle sauvegardée dans $BACKUP_DIR"
}

# Créer un commit Git de sauvegarde
create_backup_commit() {
    log "Création d'un commit de sauvegarde..."
    
    cd "$PROJECT_ROOT"
    
    # Vérifier s'il y a des changements non commités
    if [[ -n $(git status --porcelain) ]]; then
        git add .
        git commit -m "🔒 BACKUP: Sauvegarde avant migration vers Workflow V2 [$(date +%Y-%m-%d)]"
        success "Commit de sauvegarde créé"
    else
        warning "Aucun changement à sauvegarder"
    fi
}

# Créer une branche de migration
create_migration_branch() {
    log "Création de la branche de migration..."
    
    cd "$PROJECT_ROOT"
    
    # Créer et basculer sur la branche de migration
    git checkout -b "feature/workflow-v2-migration-$(date +%Y%m%d)"
    success "Branche de migration créée"
}

# Installer les dépendances nécessaires
install_dependencies() {
    log "Installation des dépendances..."
    
    cd "$PROJECT_ROOT"
    
    # Vérifier si les dépendances sont déjà installées
    if [[ -d "node_modules" ]]; then
        log "Vérification des dépendances existantes..."
        
        # Vérifier les dépendances spécifiques au workflow
        if npm list @types/react &> /dev/null; then
            success "Dépendances déjà installées"
            return
        fi
    fi
    
    # Installer les dépendances
    if command -v yarn &> /dev/null; then
        yarn install
    else
        npm install
    fi
    
    success "Dépendances installées"
}

# Vérifier la structure de la base de données
check_database_structure() {
    log "Vérification de la structure de la base de données..."
    
    # Vérifier que la table workflow_states existe
    # Cette vérification peut être adaptée selon votre configuration
    log "⚠️  Vérifiez manuellement que la table 'workflow_states' existe dans votre base de données"
    log "⚠️  Vérifiez que les politiques RLS sont en place"
    
    read -p "La table workflow_states existe-t-elle ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Migration annulée : la table workflow_states n'existe pas"
    fi
    
    success "Structure de base de données vérifiée"
}

# Déployer les nouveaux composants
deploy_new_components() {
    log "Déploiement des nouveaux composants..."
    
    # Les composants ont déjà été créés par l'édition de fichiers
    # Cette fonction vérifie leur présence
    local required_files=(
        "src/contexts/WorkflowContext.tsx"
        "src/components/StepGuard.tsx"
        "src/components/WorkflowManager.tsx"
        "src/components/WorkflowGuardV2.tsx"
        "src/components/InitializationWizardV2.tsx"
        "src/utils/errorHandlers.ts"
        "src/utils/workflowLogger.ts"
        "src/tests/workflow.test.tsx"
        "src/tests/errorCases.test.ts"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$PROJECT_ROOT/$file" ]]; then
            log "✅ $file présent"
        else
            error "❌ $file manquant"
        fi
    done
    
    success "Tous les composants sont présents"
}

# Vérifier la compilation TypeScript
check_typescript_compilation() {
    log "Vérification de la compilation TypeScript..."
    
    cd "$PROJECT_ROOT"
    
    # Vérifier la compilation
    if command -v npx &> /dev/null; then
        npx tsc --noEmit
        success "Compilation TypeScript réussie"
    else
        warning "npx non disponible, compilation TypeScript ignorée"
    fi
}

# Lancer les tests
run_tests() {
    log "Exécution des tests..."
    
    cd "$PROJECT_ROOT"
    
    # Vérifier si Jest est configuré
    if [[ -f "jest.config.js" ]] || [[ -f "jest.config.ts" ]] || grep -q "jest" package.json; then
        if command -v npx &> /dev/null; then
            npx jest --passWithNoTests --testPathPattern="workflow|errorCases"
            success "Tests exécutés avec succès"
        else
            warning "npx non disponible, tests ignorés"
        fi
    else
        warning "Jest non configuré, tests ignorés"
    fi
}

# Créer un commit de migration
create_migration_commit() {
    log "Création du commit de migration..."
    
    cd "$PROJECT_ROOT"
    
    git add .
    git commit -m "🚀 FEAT: Migration vers Workflow V2

- Nouveau système de gestion d'état centralisé
- Gestion d'erreurs robuste avec récupération automatique
- Logging complet et métriques de performance
- Composants refactorisés avec StepGuard et WorkflowManager
- Tests complets pour tous les scénarios
- Intégration avec les tables workflow_states existantes

Migration complète du workflow d'initialisation
Résout les problèmes de perte de contexte et de synchronisation
Maintient la rétrocompatibilité avec l'existant"
    
    success "Commit de migration créé"
}

# Créer un fichier de rollback
create_rollback_script() {
    log "Création du script de rollback..."
    
    cat > "$PROJECT_ROOT/scripts/rollback-workflow-v2.sh" << 'EOF'
#!/bin/bash

# Script de rollback vers Workflow V1
# Utilisez ce script en cas de problème avec la migration

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"

echo "🔙 Rollback vers Workflow V1..."

# Trouver la sauvegarde la plus récente
LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | grep "workflow-v1-" | head -1)

if [[ -z "$LATEST_BACKUP" ]]; then
    echo "❌ Aucune sauvegarde trouvée"
    exit 1
fi

echo "📦 Restauration depuis $LATEST_BACKUP"

# Restaurer les fichiers
cp "$BACKUP_DIR/$LATEST_BACKUP/WorkflowGuard.tsx" "$PROJECT_ROOT/src/components/" 2>/dev/null || true
cp "$BACKUP_DIR/$LATEST_BACKUP/InitializationWizard.tsx" "$PROJECT_ROOT/src/components/" 2>/dev/null || true
cp "$BACKUP_DIR/$LATEST_BACKUP/App.tsx" "$PROJECT_ROOT/src/" 2>/dev/null || true
cp "$BACKUP_DIR/$LATEST_BACKUP/workflow.ts" "$PROJECT_ROOT/src/types/" 2>/dev/null || true

echo "✅ Rollback terminé"
echo "🔄 Redémarrez votre application"
EOF
    
    chmod +x "$PROJECT_ROOT/scripts/rollback-workflow-v2.sh"
    success "Script de rollback créé"
}

# Afficher les instructions post-migration
show_post_migration_instructions() {
    log "📋 Instructions post-migration..."
    
    cat << EOF

🎉 Migration vers Workflow V2 terminée avec succès !

📋 Prochaines étapes :

1. 🔍 Testez l'application en mode développement
   - Vérifiez que le workflow d'initialisation fonctionne
   - Testez la gestion d'erreurs
   - Validez la performance (2s entre étapes)

2. 🧪 Exécutez les tests complets
   npm run test:workflow

3. 🚀 Déployez en production
   - Commencez par un sous-ensemble d'utilisateurs
   - Monitorer les métriques et logs
   - Ajuster la configuration si nécessaire

4. 📊 Surveillez les métriques
   - Taux de completion du workflow
   - Temps moyen par étape
   - Taux d'erreur par type

🔄 En cas de problème, utilisez le script de rollback :
   ./scripts/rollback-workflow-v2.sh

📁 Fichiers de sauvegarde : $BACKUP_DIR
📝 Logs de migration : $LOG_FILE

EOF
}

# Fonction principale
main() {
    echo "🚀 Migration vers Workflow V2"
    echo "================================"
    echo
    
    # Créer le fichier de log
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
    
    log "Début de la migration vers Workflow V2"
    
    check_prerequisites
    create_directories
    backup_current_version
    create_backup_commit
    create_migration_branch
    install_dependencies
    check_database_structure
    deploy_new_components
    check_typescript_compilation
    run_tests
    create_migration_commit
    create_rollback_script
    show_post_migration_instructions
    
    success "Migration vers Workflow V2 terminée avec succès !"
    log "Migration terminée"
}

# Exécuter le script principal
main "$@"
