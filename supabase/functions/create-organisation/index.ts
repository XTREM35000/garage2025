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

    const { nom, slug, email_admin, password, plan = 'starter' } = await req.json();

    // Validation des données
    if (!nom || !slug || !email_admin || !password) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🏗️ Création organisation:', { nom, slug, email_admin, plan });

    // Appel de la fonction PostgreSQL
    const { data, error } = await supabase.rpc('creer_organisation', {
      p_nom: nom,
      p_slug: slug,
      p_admin_email: email_admin,
      p_admin_password: password
    });

    if (error) {
      console.error('❌ Erreur création organisation:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Organisation créée avec succès, ID:', data);

    // Mise à jour du plan si différent de starter
    if (plan !== 'starter') {
      await supabase
        .from('organisations')
        .update({ plan_abonnement: plan })
        .eq('id', data);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        organisation_id: data,
        message: `Organisation "${nom}" créée avec succès!`
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