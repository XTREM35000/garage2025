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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, data } = await req.json()

    switch (action) {
      case 'set_organisation_context':
        return await handleSetOrganisationContext(supabaseClient, data)

      case 'log_access':
        return await handleLogAccess(supabaseClient, data)

      case 'get_user_context':
        return await handleGetUserContext(supabaseClient, data)

      case 'validate_access':
        return await handleValidateAccess(supabaseClient, data)

      default:
        return new Response(
          JSON.stringify({ error: 'Action non reconnue' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

  } catch (error) {
    console.error('Erreur dans multi-tenant-context:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Définir le contexte organisationnel pour un utilisateur
async function handleSetOrganisationContext(supabaseClient: any, data: any) {
  const { organisationId, userId } = data

  if (!organisationId || !userId) {
    return new Response(
      JSON.stringify({ error: 'organisationId et userId requis' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Vérifier que l'utilisateur a accès à cette organisation
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('id, role, organisation_id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non trouvé' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Vérifier les permissions
    const isSuperAdmin = await checkSuperAdmin(supabaseClient, userId)
    const hasAccess = isSuperAdmin || user.organisation_id === organisationId

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Accès non autorisé à cette organisation' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Stocker le contexte dans une table temporaire ou session
    const { error: contextError } = await supabaseClient
      .from('user_contexts')
      .upsert({
        user_id: userId,
        organisation_id: organisationId,
        set_at: new Date().toISOString()
      })

    if (contextError) {
      console.warn('Erreur lors de la sauvegarde du contexte:', contextError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contexte organisationnel défini',
        organisationId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erreur lors de la définition du contexte:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la définition du contexte' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

// Journaliser un accès
async function handleLogAccess(supabaseClient: any, data: any) {
  const {
    path,
    userId,
    userEmail,
    organisationId,
    success,
    reason,
    userAgent,
    ipAddress
  } = data

  try {
    const { error } = await supabaseClient
      .from('access_logs')
      .insert({
        path,
        user_id: userId,
        user_email: userEmail,
        organisation_id: organisationId,
        success,
        reason,
        user_agent: userAgent,
        ip_address: ipAddress
      })

    if (error) {
      console.error('Erreur lors de la journalisation:', error)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la journalisation' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Accès journalisé' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erreur lors de la journalisation:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la journalisation' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

// Obtenir le contexte utilisateur
async function handleGetUserContext(supabaseClient: any, data: any) {
  const { userId } = data

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'userId requis' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Récupérer les informations utilisateur
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select(`
        id,
        email,
        nom,
        prenom,
        role,
        organisation_id,
        organisations (
          id,
          nom,
          slug,
          plan_abonnement
        )
      `)
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non trouvé' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Vérifier si c'est un super_admin
    const isSuperAdmin = await checkSuperAdmin(supabaseClient, userId)

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          organisation_id: user.organisation_id,
          is_super_admin: isSuperAdmin
        },
        organisation: user.organisations
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erreur lors de la récupération du contexte:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la récupération du contexte' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

// Valider l'accès à une ressource
async function handleValidateAccess(supabaseClient: any, data: any) {
  const { userId, resourceType, resourceId, action } = data

  if (!userId || !resourceType || !action) {
    return new Response(
      JSON.stringify({ error: 'userId, resourceType et action requis' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Récupérer les informations utilisateur
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('id, role, organisation_id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non trouvé' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Vérifier si c'est un super_admin
    const isSuperAdmin = await checkSuperAdmin(supabaseClient, userId)

    // Logique de validation selon le type de ressource
    let hasAccess = false

    switch (resourceType) {
      case 'organisation':
        hasAccess = isSuperAdmin || user.organisation_id === resourceId
        break

      case 'user':
        // Les super_admins peuvent accéder à tous les utilisateurs
        // Les admins peuvent accéder aux utilisateurs de leur organisation
        if (isSuperAdmin) {
          hasAccess = true
        } else if (user.role === 'admin') {
          const { data: targetUser } = await supabaseClient
            .from('users')
            .select('organisation_id')
            .eq('id', resourceId)
            .single()
          hasAccess = targetUser?.organisation_id === user.organisation_id
        } else {
          hasAccess = user.id === resourceId // Utilisateur peut accéder à son propre profil
        }
        break

      case 'vehicle':
      case 'client':
      case 'reparation':
      case 'stock':
        // Vérifier que la ressource appartient à l'organisation de l'utilisateur
        if (isSuperAdmin) {
          hasAccess = true
        } else {
          const { data: resource } = await supabaseClient
            .from(resourceType + 's')
            .select('organisation_id')
            .eq('id', resourceId)
            .single()
          hasAccess = resource?.organisation_id === user.organisation_id
        }
        break

      default:
        hasAccess = isSuperAdmin
    }

    return new Response(
      JSON.stringify({
        hasAccess,
        user: {
          id: user.id,
          role: user.role,
          organisation_id: user.organisation_id,
          is_super_admin: isSuperAdmin
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erreur lors de la validation d\'accès:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la validation d\'accès' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

// Fonction utilitaire pour vérifier si un utilisateur est super_admin
async function checkSuperAdmin(supabaseClient: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('super_admins')
      .select('id')
      .eq('id', userId)
      .eq('est_actif', true)
      .single()

    return !error && !!data
  } catch (error) {
    console.error('Erreur lors de la vérification super_admin:', error)
    return false
  }
}
