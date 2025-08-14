import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, phone, nom, prenom } = await req.json()

    // Validation des données
    if (!email || !password || !phone || !nom || !prenom) {
      return new Response(
        JSON.stringify({ error: 'Toutes les données sont requises' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🏗️ Configuration Super-Admin:', { email, nom, prenom })

    let userId: string

    // 1. Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const user = existingUser.users.find(u => u.email === email)

    if (user) {
      // L'utilisateur existe, vérifier le mot de passe
      try {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        })

        if (signInData.user) {
          userId = signInData.user.id
          console.log('✅ Utilisateur existant, connexion réussie:', email)
        } else {
          throw new Error('Mot de passe incorrect')
        }
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Utilisateur existant mais mot de passe incorrect' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Créer un nouvel utilisateur
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: `${prenom} ${nom}`,
          phone: phone,
          role: 'superadmin'
        }
      })

      if (authError || !authData.user) {
        console.error('❌ Erreur création utilisateur:', authError)
        return new Response(
          JSON.stringify({ error: `Erreur création utilisateur: ${authError?.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      userId = authData.user.id
      console.log('✅ Nouveau compte créé:', email)
    }

    // 2. Vérifier si l'utilisateur est déjà super admin
    const { data: existingSuperAdmin } = await supabase
      .from('super_admins')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Cet utilisateur est déjà Super-Admin' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Création dans super_admins (avec service role, contourne RLS)
    const { error: insertError } = await supabase
      .from('super_admins')
      .insert({
        user_id: userId,
        email: email,
        nom: nom,
        prenom: prenom,
        phone: phone,
        est_actif: true
      })

    if (insertError) {
      console.error('❌ Erreur insertion super_admins:', insertError)
      return new Response(
        JSON.stringify({ error: `Erreur insertion: ${insertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Créer la relation user_organizations pour le Super-Admin
    const { data: orgs } = await supabase
      .from('organisations')
      .select('id')
      .limit(1)

    if (orgs && orgs.length > 0) {
      const { error: userOrgError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: userId,
          organization_id: orgs[0].id,
          role: 'superadmin'
        })

      if (userOrgError) {
        console.error('⚠️ Erreur création relation user_organizations:', userOrgError)
        // Ne pas échouer pour cette erreur
      }
    }

    console.log('✅ Super-Admin configuré avec succès:', userId)

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: userId, email: email },
        profile: {
          id: userId,
          email: email,
          nom: nom,
          prenom: prenom,
          role: 'superadmin'
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erreur dans setup-super-admin:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
