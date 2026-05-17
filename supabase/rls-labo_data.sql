-- Labosync — RLS sur labo_data (à exécuter dans Supabase → SQL Editor)
-- Prérequis : table public.labo_data avec colonnes id (text PK), data (jsonb), updated_at

ALTER TABLE public.labo_data ENABLE ROW LEVEL SECURITY;

-- Supprimer d’anciennes policies si vous réexécutez ce script
DROP POLICY IF EXISTS "labo_own_row" ON public.labo_data;
DROP POLICY IF EXISTS "labo_tenant_json" ON public.labo_data;
DROP POLICY IF EXISTS "suivi_public_read" ON public.labo_data;
DROP POLICY IF EXISTS "deny_anon_write" ON public.labo_data;

-- Ligne principale du labo : id = UUID utilisateur Auth
CREATE POLICY "labo_own_row" ON public.labo_data
  FOR ALL
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- Données liées au labo via data.labUserId (portal_*, orders_*, chat_*, stripe_connect_*, sub_*, etc.)
CREATE POLICY "labo_tenant_json" ON public.labo_data
  FOR ALL
  USING (
    (data->>'labUserId') IS NOT NULL
    AND (data->>'labUserId') = auth.uid()::text
  )
  WITH CHECK (
    (data->>'labUserId') IS NOT NULL
    AND (data->>'labUserId') = auth.uid()::text
  );

-- Suivi patient public en lecture seule (optionnel — retirer si non utilisé)
CREATE POLICY "suivi_public_read" ON public.labo_data
  FOR SELECT
  USING (id LIKE 'suivi_%');

-- Les écritures cabinet passent par Netlify (service role), pas par anon.
