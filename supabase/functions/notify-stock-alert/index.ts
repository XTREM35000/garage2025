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
    const { pieceId, action } = await req.json()

    // Validate input
    if (!pieceId) {
      throw new Error('ID de pièce requis')
    }

    // Récupérer les informations de la pièce
    const { data: piece, error: pieceError } = await supabaseClient
      .from('pieces')
      .select('*')
      .eq('id', pieceId)
      .single()

    if (pieceError || !piece) {
      throw new Error('Pièce non trouvée')
    }

    // Récupérer les utilisateurs qui doivent être notifiés (admins et comptables)
    const { data: users, error: usersError } = await supabaseClient
      .from('profiles')
      .select('*')
      .in('role', ['proprietaire', 'chef-garagiste', 'comptable'])
      .eq('statut', 'actif')

    if (usersError) {
      console.error('Erreur récupération utilisateurs:', usersError)
    }

    // Créer la notification
    const notification = {
      type: 'stock_alert',
      titre: 'Alerte Stock',
      message: action === 'rupture'
        ? `Rupture de stock pour ${piece.nom} (${piece.reference})`
        : `Stock faible pour ${piece.nom} (${piece.reference}) - Quantité: ${piece.stock_actuel}`,
      donnees: {
        piece_id: pieceId,
        piece_nom: piece.nom,
        piece_reference: piece.reference,
        stock_actuel: piece.stock_actuel,
        stock_minimum: piece.stock_minimum,
        action: action
      },
      date_creation: new Date().toISOString(),
      statut: 'non_lu'
    }

    // Insérer la notification dans la base de données
    const { data: notificationData, error: notificationError } = await supabaseClient
      .from('notifications')
      .insert([notification])
      .select()
      .single()

    if (notificationError) {
      console.error('Erreur création notification:', notificationError)
    }

    // Envoyer des notifications par email (si configuré)
    if (users && users.length > 0) {
      for (const user of users) {
        try {
          // Ici on pourrait intégrer un service d'email comme SendGrid ou Resend
          console.log(`Notification envoyée à ${user.email}: ${notification.message}`)

          // Pour l'instant, on log simplement
          // Dans une version future, on pourrait utiliser:
          // await sendEmail(user.email, notification.titre, notification.message)
        } catch (emailError) {
          console.error(`Erreur envoi email à ${user.email}:`, emailError)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notification: notificationData,
        usersNotifies: users?.length || 0
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
