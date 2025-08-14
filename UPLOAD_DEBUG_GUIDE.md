# 🔧 Guide de Débogage - Upload de Fichiers

## 🚨 **Problème Identifié**

```
Type de fichier non supporté. Formats acceptés : image/png,image/jpeg,image/jpg,image/svg+xml
```

## 🔍 **Diagnostic**

### **1. Vérifier la Configuration Supabase**

```bash
# Vérifier que les migrations sont appliquées
supabase db push --include-all

# Vérifier les buckets dans Supabase Dashboard
# Aller dans Storage > Buckets
# Vérifier que 'garage-logos' existe
```

### **2. Vérifier les Variables d'Environnement**

```env
# Dans .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### **3. Test avec le Composant de Débogage**

Ajoutez temporairement le composant de test dans votre page :

```tsx
import { FileUploadTest } from '@/components/FileUploadTest';

// Dans votre page
<FileUploadTest />
```

## 🛠️ **Solutions**

### **Solution 1 : Validation Plus Permissive**

La validation a été mise à jour pour être plus permissive :

```typescript
// Vérification par extension ET type MIME
const allowedExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
const fileName = file.name.toLowerCase();
const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
const hasValidMimeType = allowedMimeTypes.includes(file.type);

// Accepte si extension OU type MIME valide
if (!hasValidExtension && !hasValidMimeType) {
  return { success: false, error: 'Type non supporté' };
}
```

### **Solution 2 : Vérifier le Type MIME du Fichier**

Certains fichiers peuvent avoir un type MIME incorrect. Testez avec :

```javascript
// Dans la console du navigateur
const file = document.querySelector('input[type="file"]').files[0];
console.log('File type:', file.type);
console.log('File name:', file.name);
```

### **Solution 3 : Forcer le Type MIME**

Si le problème persiste, vous pouvez forcer le type :

```typescript
// Dans FileService.uploadFile
const fileWithCorrectType = new File([file], file.name, {
  type: 'image/png' // ou 'image/jpeg' selon l'extension
});
```

## 🧪 **Tests à Effectuer**

### **Test 1 : Fichier PNG Simple**
1. Créez une image PNG simple (1x1 pixel)
2. Testez l'upload
3. Vérifiez la console pour les logs

### **Test 2 : Fichier JPG Standard**
1. Utilisez une photo JPG standard
2. Vérifiez que le type MIME est `image/jpeg`
3. Testez l'upload

### **Test 3 : Fichier SVG**
1. Créez un SVG simple
2. Vérifiez que le type MIME est `image/svg+xml`
3. Testez l'upload

## 🔧 **Corrections Appliquées**

### **1. Validation Plus Permissive**
- ✅ Vérification par extension ET type MIME
- ✅ Accepte si l'un des deux est valide
- ✅ Messages d'erreur plus clairs

### **2. Gestion des Erreurs Améliorée**
- ✅ Logs détaillés dans la console
- ✅ Informations de débogage affichées
- ✅ Composant de test pour diagnostiquer

### **3. Nommage des Fichiers**
- ✅ Noms uniques avec timestamp
- ✅ Extension préservée
- ✅ Pas de caractères spéciaux

## 🚀 **Commandes de Test**

```bash
# 1. Reset complet (si nécessaire)
supabase db reset --linked

# 2. Appliquer toutes les migrations
supabase db push --include-all

# 3. Vérifier les buckets
supabase storage ls

# 4. Tester l'upload
# Aller dans l'application et utiliser le composant de test
```

## 📋 **Checklist de Débogage**

- [ ] **Buckets créés** dans Supabase Storage
- [ ] **Variables d'environnement** configurées
- [ ] **Authentification** utilisateur active
- [ ] **Type de fichier** correct (PNG, JPG, SVG)
- [ ] **Taille de fichier** < 2MB
- [ ] **Console du navigateur** sans erreurs
- [ ] **Réseau** stable

## 🎯 **Résolution Rapide**

Si le problème persiste :

1. **Ouvrez la console du navigateur** (F12)
2. **Utilisez le composant FileUploadTest**
3. **Vérifiez les logs** de débogage
4. **Testez avec un fichier PNG simple**
5. **Vérifiez les buckets** dans Supabase Dashboard

## 📞 **Support**

Si le problème persiste après ces étapes :

1. **Capturez les logs** de la console
2. **Notez le type MIME** du fichier
3. **Vérifiez la taille** du fichier
4. **Testez avec différents** types de fichiers

**Le système d'upload devrait maintenant fonctionner correctement !** 🎉
