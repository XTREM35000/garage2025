-- Ajout d'organisations de démonstration
INSERT INTO public.organisations (id, name, code, description, subscription_type, is_active, created_at)
VALUES 
  (
    gen_random_uuid(),
    'Garage Central Abidjan',
    'GCA001',
    'Garage principal situé au centre d\'Abidjan',
    'monthly',
    true,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Auto Service Plateau',
    'ASP002',
    'Service automobile spécialisé dans le Plateau',
    'monthly',
    true,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Mécanique Express',
    'MEX003',
    'Service de mécanique rapide et efficace',
    'lifetime',
    true,
    NOW()
  )
ON CONFLICT (code) DO NOTHING;

-- Vérifier que les organisations ont été créées
DO $$
DECLARE
  org_count integer;
BEGIN
  SELECT COUNT(*) INTO org_count FROM public.organisations;
  RAISE NOTICE 'Organisations créées: %', org_count;
  
  -- Afficher les organisations créées
  FOR org_record IN SELECT name, code FROM public.organisations ORDER BY name
  LOOP
    RAISE NOTICE 'Organisation: % (Code: %)', org_record.name, org_record.code;
  END LOOP;
END $$;
