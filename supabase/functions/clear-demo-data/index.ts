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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Supprimer toutes les données dans l'ordre pour respecter les contraintes de clés étrangères
    const tablesToClear = [
      'factures',
      'reparations',
      'vehicules',
      'clients',
      'pieces',
      'notifications',
      'historique_actions'
    ]

    const results = {}

    for (const table of tablesToClear) {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Supprimer tout sauf les enregistrements système

      if (error) {
        console.warn(`Avertissement suppression ${table}: ${error.message}`)
        results[table] = { error: error.message }
      } else {
        results[table] = { success: true, count: data?.length || 0 }
      }
    }

    // Réinitialiser les séquences si nécessaire
    try {
      await supabase.rpc('reset_facture_sequence')
    } catch (error) {
      console.warn('Impossible de réinitialiser la séquence facture:', error.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Toutes les données de démonstration ont été supprimées',
        results
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
        status: 500,
      }
    )
  }
})
