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
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { email, password, nom, prenom, role } = await req.json()

    // Validate input
    if (!email || !password) {
      throw new Error('Email et mot de passe requis')
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        nom: nom || 'Admin',
        prenom: prenom || 'Utilisateur',
        role: role || 'proprietaire'
      }
    })

    if (authError) {
      throw new Error(`Erreur création utilisateur: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Aucun utilisateur créé')
    }

    // Update the profile with additional information
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        nom: nom || 'Admin',
        prenom: prenom || 'Utilisateur',
        role: role || 'proprietaire',
        statut: 'actif'
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('Erreur mise à jour profil:', profileError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: role || 'proprietaire'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
