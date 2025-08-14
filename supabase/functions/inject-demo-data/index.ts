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

    // Données de démonstration pour les clients
    const demoClients = [
      {
        nom: 'Kouassi',
        prenom: 'Jean',
        telephone: '+225 0701234567',
        email: 'kouassi.jean@email.com',
        adresse: 'Cocody, Abidjan',
        date_naissance: '1985-03-15',
        numero_permis: 'CI-123456789',
        statut: 'actif',
        notes: 'Client fidèle depuis 3 ans'
      },
      {
        nom: 'Diabaté',
        prenom: 'Fatou',
        telephone: '+225 0702345678',
        email: 'diabate.fatou@email.com',
        adresse: 'Marcory, Abidjan',
        date_naissance: '1990-07-22',
        numero_permis: 'CI-234567890',
        statut: 'vip',
        notes: 'Client VIP - réparations fréquentes'
      },
      {
        nom: 'Traoré',
        prenom: 'Ali',
        telephone: '+225 0703456789',
        email: 'traore.ali@email.com',
        adresse: 'Plateau, Abidjan',
        date_naissance: '1988-11-08',
        numero_permis: 'CI-345678901',
        statut: 'actif',
        notes: 'Nouveau client - première visite'
      },
      {
        nom: 'Yao',
        prenom: 'Marie',
        telephone: '+225 0704567890',
        email: 'yao.marie@email.com',
        adresse: 'Yopougon, Abidjan',
        date_naissance: '1992-04-12',
        numero_permis: 'CI-456789012',
        statut: 'nouveau',
        notes: 'Client récent'
      },
      {
        nom: 'Koné',
        prenom: 'Issouf',
        telephone: '+225 0705678901',
        email: 'kone.issouf@email.com',
        adresse: 'Adjamé, Abidjan',
        date_naissance: '1983-09-30',
        numero_permis: 'CI-567890123',
        statut: 'actif',
        notes: 'Client régulier'
      }
    ]

    // Données de démonstration pour les véhicules
    const demoVehicles = [
      {
        marque: 'Toyota',
        modele: 'Corolla',
        immatriculation: 'CI-123-AB-456',
        annee: '2018',
        couleur: 'Blanc',
        carburant: 'Essence',
        kilometrage: '75000',
        numero_chassis: 'JTDKARFU123456789',
        date_acquisition: '2018-06-15',
        etat: 'Très bon',
        notes: 'Véhicule en bon état général'
      },
      {
        marque: 'Peugeot',
        modele: '206',
        immatriculation: 'CI-234-CD-789',
        annee: '2015',
        couleur: 'Rouge',
        carburant: 'Diesel',
        kilometrage: '120000',
        numero_chassis: 'VF3XXXXXXXXXXXXXX',
        date_acquisition: '2015-03-20',
        etat: 'Bon',
        notes: 'Révision récente effectuée'
      },
      {
        marque: 'Renault',
        modele: 'Logan',
        immatriculation: 'CI-345-EF-012',
        annee: '2019',
        couleur: 'Gris',
        carburant: 'Essence',
        kilometrage: '45000',
        numero_chassis: 'VF1XXXXXXXXXXXXXX',
        date_acquisition: '2019-08-10',
        etat: 'Excellent',
        notes: 'Véhicule quasi-neuf'
      },
      {
        marque: 'Hyundai',
        modele: 'i10',
        immatriculation: 'CI-456-GH-345',
        annee: '2020',
        couleur: 'Bleu',
        carburant: 'Essence',
        kilometrage: '30000',
        numero_chassis: 'KMHXXXXXXXXXXXXXX',
        date_acquisition: '2020-01-15',
        etat: 'Excellent',
        notes: 'Véhicule de ville parfait'
      },
      {
        marque: 'Dacia',
        modele: 'Sandero',
        immatriculation: 'CI-567-IJ-678',
        annee: '2016',
        couleur: 'Vert',
        carburant: 'Diesel',
        kilometrage: '95000',
        numero_chassis: 'VF1XXXXXXXXXXXXXX',
        date_acquisition: '2016-11-05',
        etat: 'Bon',
        notes: 'Véhicule fiable'
      }
    ]

    // Données de démonstration pour les réparations
    const demoRepairs = [
      {
        statut: 'Terminé',
        description: 'Vidange huile moteur et filtre à huile',
        prix: 25000,
        date_debut: '2024-01-15 09:00:00',
        date_fin: '2024-01-15 11:00:00',
        priorite: 'Normale',
        notes: 'Entretien régulier effectué',
        temps_estime: 2,
        temps_reel: 2
      },
      {
        statut: 'En cours',
        description: 'Remplacement plaquettes de frein avant',
        prix: 45000,
        date_debut: '2024-01-20 14:00:00',
        priorite: 'Haute',
        notes: 'Réparation en cours',
        temps_estime: 3,
        temps_reel: 2
      },
      {
        statut: 'En attente',
        description: 'Diagnostic panne électrique',
        prix: 15000,
        date_debut: '2024-01-25 10:00:00',
        priorite: 'Normale',
        notes: 'En attente de diagnostic',
        temps_estime: 1
      },
      {
        statut: 'Terminé',
        description: 'Remplacement batterie',
        prix: 35000,
        date_debut: '2024-01-10 08:00:00',
        date_fin: '2024-01-10 09:30:00',
        priorite: 'Urgente',
        notes: 'Batterie remplacée avec succès',
        temps_estime: 1,
        temps_reel: 1.5
      },
      {
        statut: 'Terminé',
        description: 'Révision complète 100 000 km',
        prix: 85000,
        date_debut: '2024-01-05 08:00:00',
        date_fin: '2024-01-05 16:00:00',
        priorite: 'Normale',
        notes: 'Révision complète effectuée',
        temps_estime: 8,
        temps_reel: 8
      }
    ]

    // Données de démonstration pour les pièces
    const demoParts = [
      {
        nom: 'Filtre à huile',
        reference: 'FO-001',
        categorie: 'Filtres',
        marque: 'Toyota',
        modele_compatible: ['Corolla', 'Camry', 'Yaris'],
        prix_achat: 5000,
        prix_vente: 8000,
        quantite_stock: 25,
        quantite_minimum: 10,
        fournisseur: 'Toyota Parts',
        localisation: 'Rayon A-1',
        notes: 'Filtre à huile haute qualité'
      },
      {
        nom: 'Plaquettes de frein avant',
        reference: 'PB-002',
        categorie: 'Freinage',
        marque: 'Peugeot',
        modele_compatible: ['206', '207', '208'],
        prix_achat: 15000,
        prix_vente: 25000,
        quantite_stock: 8,
        quantite_minimum: 5,
        fournisseur: 'Peugeot Parts',
        localisation: 'Rayon B-2',
        notes: 'Plaquettes de frein avant'
      },
      {
        nom: 'Batterie 60Ah',
        reference: 'BAT-003',
        categorie: 'Électrique',
        marque: 'Bosch',
        modele_compatible: ['Tous modèles'],
        prix_achat: 25000,
        prix_vente: 40000,
        quantite_stock: 3,
        quantite_minimum: 5,
        fournisseur: 'Bosch Côte d\'Ivoire',
        localisation: 'Rayon C-3',
        notes: 'Batterie 60Ah haute performance'
      },
      {
        nom: 'Huile moteur 5W30',
        reference: 'OIL-004',
        categorie: 'Lubrifiants',
        marque: 'Total',
        modele_compatible: ['Tous modèles essence'],
        prix_achat: 8000,
        prix_vente: 12000,
        quantite_stock: 15,
        quantite_minimum: 10,
        fournisseur: 'Total Côte d\'Ivoire',
        localisation: 'Rayon D-4',
        notes: 'Huile moteur synthétique 5W30'
      },
      {
        nom: 'Ampoule phare H4',
        reference: 'BULB-005',
        categorie: 'Éclairage',
        marque: 'Philips',
        modele_compatible: ['Tous modèles'],
        prix_achat: 2000,
        prix_vente: 3500,
        quantite_stock: 2,
        quantite_minimum: 10,
        fournisseur: 'Philips Lighting',
        localisation: 'Rayon E-5',
        notes: 'Ampoule phare H4 haute luminosité'
      }
    ]

    // Insérer les clients
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .insert(demoClients)
      .select()

    if (clientsError) {
      throw new Error(`Erreur insertion clients: ${clientsError.message}`)
    }

    // Insérer les véhicules avec les propriétaires
    const vehiclesWithOwners = demoVehicles.map((vehicle, index) => ({
      ...vehicle,
      proprietaire_id: clientsData[index]?.id
    }))

    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from('vehicules')
      .insert(vehiclesWithOwners)
      .select()

    if (vehiclesError) {
      throw new Error(`Erreur insertion véhicules: ${vehiclesError.message}`)
    }

    // Insérer les réparations avec les véhicules et clients
    const repairsWithRelations = demoRepairs.map((repair, index) => ({
      ...repair,
      vehicule_id: vehiclesData[index]?.id,
      client_id: clientsData[index]?.id
    }))

    const { data: repairsData, error: repairsError } = await supabase
      .from('reparations')
      .insert(repairsWithRelations)
      .select()

    if (repairsError) {
      throw new Error(`Erreur insertion réparations: ${repairsError.message}`)
    }

    // Insérer les pièces
    const { data: partsData, error: partsError } = await supabase
      .from('pieces')
      .insert(demoParts)
      .select()

    if (partsError) {
      throw new Error(`Erreur insertion pièces: ${partsError.message}`)
    }

    // Créer des notifications de démonstration
    const demoNotifications = [
      {
        titre: 'Données de démonstration injectées',
        message: 'Les données de démonstration ont été ajoutées avec succès à la base de données.',
        type: 'success'
      },
      {
        titre: 'Stock faible détecté',
        message: 'Certaines pièces ont un stock faible. Vérifiez le stock.',
        type: 'warning'
      },
      {
        titre: 'Réparation terminée',
        message: 'La réparation #1 a été terminée avec succès.',
        type: 'info'
      }
    ]

    // Insérer les notifications (sans user_id pour la démo)
    const { error: notificationsError } = await supabase
      .from('notifications')
      .insert(demoNotifications)

    if (notificationsError) {
      console.warn(`Avertissement notifications: ${notificationsError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Données de démonstration injectées avec succès',
        data: {
          clients: clientsData?.length || 0,
          vehicles: vehiclesData?.length || 0,
          repairs: repairsData?.length || 0,
          parts: partsData?.length || 0
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
        status: 500,
      }
    )
  }
})
