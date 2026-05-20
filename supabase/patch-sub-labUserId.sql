-- Corrige les lignes d'abonnement existantes pour la policy RLS labo_tenant_json (optionnel si vous utilisez lab-subscription.js).
-- À exécuter une fois dans Supabase → SQL Editor.

UPDATE public.labo_data
SET data = data || jsonb_build_object(
  'labUserId',
  COALESCE(data->>'labUserId', data->>'userId', replace(id, 'sub_', ''))
)
WHERE id LIKE 'sub_%'
  AND (data->>'labUserId') IS NULL;
