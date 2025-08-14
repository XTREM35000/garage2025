import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { organisationId, slug } = await req.json();

    let orgId = organisationId;

    // Si slug fourni, récupérer l'ID de l'organisation
    if (slug && !organisationId) {
      const { data: org, error } = await supabase
        .from('organisations')
        .select('id')
        .eq('slug', slug)
        .eq('est_actif', true)
        .single();

      if (error || !org) {
        return new Response(
          JSON.stringify({ error: 'Organisation non trouvée' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      orgId = org.id;
    }

    if (!orgId) {
      return new Response(
        JSON.stringify({ error: 'ID organisation requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 Définition contexte organisation:', orgId);

    // Définir le contexte pour cette session
    const { error: contextError } = await supabase.rpc('set_config', {
      setting_name: 'app.current_organisation_id',
      new_value: orgId,
      is_local: false
    });

    if (contextError) {
      console.error('❌ Erreur définition contexte:', contextError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        organisation_id: orgId,
        message: 'Contexte organisation défini'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});