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
    const { reportType, dateFrom, dateTo, filters } = await req.json()

    // Validate input
    if (!reportType) {
      throw new Error('Type de rapport requis')
    }

    let reportData: any = {}

    switch (reportType) {
      case 'interventions':
        // Récupérer les interventions pour la période
        const { data: interventions, error: interventionsError } = await supabaseClient
          .from('interventions')
          .select(`
            *,
            vehicules(marque, modele, immatriculation),
            clients(nom, prenom, telephone)
          `)
          .gte('date_debut', dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .lte('date_debut', dateTo || new Date().toISOString())
          .order('date_debut', { ascending: false })

        if (interventionsError) throw interventionsError
        reportData.interventions = interventions || []

        // Calculer les statistiques
        const totalInterventions = reportData.interventions.length
        const interventionsTerminees = reportData.interventions.filter((i: any) => i.statut === 'termine').length
        const chiffreAffaires = reportData.interventions
          .filter((i: any) => i.statut === 'termine' && i.cout_final)
          .reduce((sum: number, i: any) => sum + parseFloat(i.cout_final), 0)

        reportData.statistics = {
          total: totalInterventions,
          terminees: interventionsTerminees,
          chiffreAffaires: chiffreAffaires,
          tauxCompletion: totalInterventions > 0 ? (interventionsTerminees / totalInterventions * 100).toFixed(2) : 0
        }
        break

      case 'clients':
        // Récupérer les clients
        const { data: clients, error: clientsError } = await supabaseClient
          .from('clients')
          .select('*')
          .order('date_creation', { ascending: false })

        if (clientsError) throw clientsError
        reportData.clients = clients || []

        // Statistiques clients
        const totalClients = reportData.clients.length
        const clientsActifs = reportData.clients.filter((c: any) => c.statut === 'actif').length

        reportData.statistics = {
          total: totalClients,
          actifs: clientsActifs,
          inactifs: totalClients - clientsActifs
        }
        break

      case 'stock':
        // Récupérer les pièces
        const { data: pieces, error: piecesError } = await supabaseClient
          .from('pieces')
          .select('*')
          .order('stock_actuel', { ascending: true })

        if (piecesError) throw piecesError
        reportData.pieces = pieces || []

        // Statistiques stock
        const totalPieces = reportData.pieces.length
        const piecesRupture = reportData.pieces.filter((p: any) => p.stock_actuel === 0).length
        const piecesStockFaible = reportData.pieces.filter((p: any) => p.stock_actuel > 0 && p.stock_actuel <= p.stock_minimum).length
        const valeurStock = reportData.pieces.reduce((sum: number, p: any) => sum + (p.stock_actuel * parseFloat(p.prix_achat || 0)), 0)

        reportData.statistics = {
          total: totalPieces,
          rupture: piecesRupture,
          stockFaible: piecesStockFaible,
          valeurStock: valeurStock
        }
        break

      case 'dashboard':
        // Récupérer toutes les statistiques du dashboard
        const { data: dashboardStats, error: dashboardError } = await supabaseClient
          .rpc('get_dashboard_stats')

        if (dashboardError) throw dashboardError
        reportData = dashboardStats
        break

      default:
        throw new Error('Type de rapport non supporté')
    }

    // Générer le rapport en format JSON (pour l'instant)
    // Dans une version future, on pourrait intégrer une librairie PDF
    const report = {
      type: reportType,
      dateGeneration: new Date().toISOString(),
      periode: {
        from: dateFrom,
        to: dateTo
      },
      data: reportData
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: report
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
