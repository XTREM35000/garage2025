# PROMPT POUR RÉSOLUTION DES PROBLÈMES DU BRAIN MODAL

## CONTEXTE
Le BrainModal est un composant React TypeScript qui s'affiche au lancement de l'application pour configurer les informations du garage. Malgré une refonte complète, les événements de clic ne fonctionnent pas.

## PROBLÈMES IDENTIFIÉS

### 1. ÉVÉNEMENTS DE CLIC NON DÉTECTÉS
**Symptômes :**
- Aucun log de clic n'apparaît dans la console
- Les boutons semblent visuellement actifs mais ne répondent pas
- Même le bouton "Test Click" simple ne fonctionne pas
- Les événements `onMouseEnter` et `onMouseLeave` ne sont pas détectés non plus

**Éléments testés sans succès :**
- Bouton de fermeture (X rouge)
- Bouton "Suivant (HTML)"
- Bouton "Test Click"
- Clics sur le modal backdrop
- Clics sur la Card
- Clics sur le CardContent

### 2. VALIDATION TÉLÉPHONE
**Symptômes :**
- Message d'erreur persistant : "Format téléphone invalide (ex: +225 07 58 96 61 56)"
- Même avec les formats corrects

### 3. STRUCTURE ACTUELLE
Le modal a été simplifié de 4 étapes à 2 étapes :
- **Étape 1** : Tous les champs (garage, owner, address, phone, email, logo)
- **Étape 2** : Récapitulatif

## DIRECTIVES DE RÉSOLUTION

### PRIORITÉ 1 : DIAGNOSTIQUER LES ÉVÉNEMENTS DE CLIC

1. **Vérifier les conflits CSS**
   - Rechercher des styles `pointer-events: none` ou `disabled: pointer-events-none`
   - Vérifier les z-index et les superpositions d'éléments
   - S'assurer qu'aucun élément ne capture tous les événements

2. **Tester avec un composant minimal**
   - Créer un modal simple avec juste un bouton pour isoler le problème
   - Vérifier si le problème vient du composant Card ou du contexte

3. **Vérifier les hooks et le contexte**
   - S'assurer qu'aucun useEffect ne bloque les événements
   - Vérifier les dépendances des hooks
   - Contrôler le contexte ThemeContext

4. **Tester les événements natifs**
   - Utiliser `addEventListener` directement sur les éléments
   - Vérifier si React intercepte les événements

### PRIORITÉ 2 : CORRIGER LA VALIDATION TÉLÉPHONE

1. **Simplifier la validation**
   ```typescript
   // Validation plus simple
   const phoneRegex = /^\+[0-9]{1,4}[0-9]{8,10}$/;
   ```

2. **Tester avec des formats réels**
   - +225 07 58 96 61 56
   - +33 1 23 45 67 89
   - +226 70 12 34 56

3. **Ajouter des logs de validation**
   ```typescript
   console.log('Phone validation:', {
     value,
     cleanValue: value.replace(/\s/g, ''),
     matches: phoneRegex.test(value.replace(/\s/g, ''))
   });
   ```

### PRIORITÉ 3 : AMÉLIORER L'EXPÉRIENCE UTILISATEUR

1. **Feedback visuel immédiat**
   - Indiquer clairement quand un bouton est cliqué
   - Ajouter des animations de transition
   - Afficher des messages d'état

2. **Gestion d'erreurs robuste**
   - Try/catch autour de tous les gestionnaires d'événements
   - Fallback en cas d'échec
   - Messages d'erreur explicites

3. **Accessibilité**
   - Ajouter des attributs ARIA
   - Support du clavier (Tab, Enter, Escape)
   - Focus management

## CODE DE RÉFÉRENCE

### Structure actuelle du modal
```typescript
// Fichier : src/components/BrainModal.tsx
// Interface : GarageConfig avec phonePrefix, phoneNumber, phone
// Validation : validateField, validateStep, canProceedToNext
// Événements : handleInputChange, handlePhonePrefixChange, handlePhoneNumberChange
```

### Logs ajoutés pour diagnostic
```typescript
// Logs sur tous les éléments cliquables
onClick={(e) => {
  console.log('🎯 Element clicked!');
  console.log('Target:', e.target);
  e.stopPropagation();
}}
onMouseEnter={() => console.log('🎯 Mouse enter')}
onMouseLeave={() => console.log('🎯 Mouse leave')}
```

## RÉSULTAT ATTENDU

1. **Tous les boutons fonctionnent** et génèrent des logs dans la console
2. **La validation téléphone accepte** les formats internationaux
3. **Le modal se ferme** avec le bouton X
4. **La navigation entre étapes** fonctionne
5. **La configuration se sauvegarde** correctement

## FICHIERS À MODIFIER

- `src/components/BrainModal.tsx` (principal)
- `src/contexts/ThemeContext.tsx` (si conflit)
- `src/App.tsx` (si problème de contexte)
- `src/index.css` (si conflit CSS)

## TESTS À EFFECTUER

1. Ouvrir la console développeur (F12)
2. Remplir tous les champs du step 1
3. Cliquer sur chaque bouton et vérifier les logs
4. Tester différents formats de téléphone
5. Vérifier que le modal se ferme et navigue correctement

---

**NOTE IMPORTANTE :** Le problème principal semble être que les événements de clic ne sont pas du tout détectés, ce qui suggère un problème fondamental avec la gestion des événements React ou un conflit CSS/JavaScript.
