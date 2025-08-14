# Guide de Dépannage - Architecture Multi-Instances

## 🚨 Problème : Erreur 500 sur la table super_admins

### **Symptômes :**
- L'application s'arrête à 17% du splash screen
- Erreur 500 sur `/rest/v1/super_admins`
- Message "Could not establish connection"

### **Causes Possibles :**

1. **Table `super_admins` n'existe pas**
2. **Politiques RLS trop restrictives**
3. **Migration SQL non exécutée**
4. **Problème de permissions Supabase**

## 🔧 Solutions

### **Solution 1 : Exécuter la Migration de Correction**

1. **Ouvrir Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/[VOTRE_PROJECT_ID]
   ```

2. **Aller dans SQL Editor**

3. **Exécuter la migration de correction :**
   ```sql
   -- Copier et exécuter le contenu de 015_fix_super_admins_table.sql
   ```

4. **Vérifier que les tables sont créées :**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('super_admins', 'access_logs');
   ```

### **Solution 2 : Vérifier les Politiques RLS**

1. **Désactiver temporairement RLS :**
   ```sql
   ALTER TABLE public.super_admins DISABLE ROW LEVEL SECURITY;
   ```

2. **Tester l'accès :**
   ```sql
   SELECT * FROM public.super_admins LIMIT 1;
   ```

3. **Réactiver RLS avec politique permissive :**
   ```sql
   ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

   DROP POLICY IF EXISTS "super_admins_initial_access" ON public.super_admins;
   CREATE POLICY "super_admins_initial_access" ON public.super_admins
       FOR ALL USING (true);
   ```

### **Solution 3 : Vérifier les Permissions**

1. **Vérifier les permissions de l'utilisateur anon :**
   ```sql
   SELECT grantee, privilege_type
   FROM information_schema.role_table_grants
   WHERE table_name = 'super_admins';
   ```

2. **Accorder les permissions nécessaires :**
   ```sql
   GRANT SELECT, INSERT, UPDATE, DELETE ON public.super_admins TO anon;
   GRANT SELECT, INSERT, UPDATE, DELETE ON public.super_admins TO authenticated;
   ```

### **Solution 4 : Test Manuel de la Base de Données**

1. **Ouvrir la console du navigateur (F12)**

2. **Exécuter ce test :**
   ```javascript
   // Copier dans la console
   const { createClient } = supabase;
   const supabaseClient = createClient(
     'VOTRE_SUPABASE_URL',
     'VOTRE_SUPABASE_ANON_KEY'
   );

   // Test de connectivité
   supabaseClient
     .from('organisations')
     .select('count', { count: 'exact', head: true })
     .then(({ data, error }) => {
       console.log('Test organisations:', { data, error });
     });

   // Test super_admins
   supabaseClient
     .from('super_admins')
     .select('id')
     .limit(1)
     .then(({ data, error }) => {
       console.log('Test super_admins:', { data, error });
     });
   ```

## 🛠️ Outils de Diagnostic

### **Test de Connectivité Automatique**

L'application inclut maintenant un test automatique de connectivité. Si le problème persiste :

1. **Ouvrir les DevTools (F12)**
2. **Aller dans l'onglet Console**
3. **Chercher les messages commençant par 🔍, ✅, ❌, ⚠️**

### **Logs de Diagnostic**

Les logs suivants vous aideront à diagnostiquer :

```
🔍 Test de connectivité à la base de données...
✅ Connexion à la base de données réussie
✅ Table organisations accessible
⚠️ Table super_admins non accessible: [erreur]
📊 Résumé du test: { tables: { super_admins: false } }
```

## 🚀 Solutions Rapides

### **Solution Express (Temporaire)**

Si vous voulez juste faire fonctionner l'app rapidement :

1. **Créer la table manuellement :**
   ```sql
   CREATE TABLE IF NOT EXISTS public.super_admins (
       id UUID PRIMARY KEY,
       email TEXT NOT NULL UNIQUE,
       nom TEXT NOT NULL,
       prenom TEXT NOT NULL,
       phone TEXT,
       est_actif BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   ALTER TABLE public.super_admins DISABLE ROW LEVEL SECURITY;
   ```

2. **Redémarrer l'application**

### **Solution Complète (Recommandée)**

1. **Exécuter la migration 015_fix_super_admins_table.sql**
2. **Vérifier les logs de diagnostic**
3. **Tester manuellement les requêtes**
4. **Redémarrer l'application**

## 📋 Checklist de Vérification

- [ ] Migration SQL exécutée avec succès
- [ ] Tables `super_admins` et `access_logs` existent
- [ ] Politiques RLS configurées correctement
- [ ] Permissions accordées aux utilisateurs
- [ ] Test de connectivité réussi
- [ ] Logs de diagnostic sans erreur

## 🔍 Diagnostic Avancé

### **Vérifier les Logs Supabase**

1. **Aller dans Supabase Dashboard > Logs**
2. **Chercher les erreurs liées à `super_admins`**
3. **Vérifier les requêtes échouées**

### **Tester les Edge Functions**

```bash
# Déployer l'Edge Function
supabase functions deploy multi-tenant-context

# Tester la fonction
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/multi-tenant-context \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"action": "get_user_context", "data": {}}'
```

## 📞 Support

Si le problème persiste après avoir suivi ce guide :

1. **Collecter les logs de la console**
2. **Screenshot de l'erreur Supabase**
3. **Résultat du test de connectivité**
4. **Version de Supabase utilisée**

---

**Note** : Ce guide couvre les problèmes les plus courants. Si vous rencontrez une erreur spécifique, consultez les logs de diagnostic pour plus de détails.
