-- Labosync — RLS sur labo_data (à exécuter dans Supabase → SQL Editor)
-- Prérequis : table public.labo_data avec colonnes id (text PK), data (jsonb), updated_at

ALTER TABLE public.labo_data ENABLE ROW LEVEL SECURITY;

-- Supprimer d’anciennes policies si vous réexécutez ce script
DROP POLICY IF EXISTS "labo_own_row" ON public.labo_data;
DROP POLICY IF EXISTS "labo_tenant_json" ON public.labo_data;
DROP POLICY IF EXISTS "labo_tenant_json_read" ON public.labo_data;
DROP POLICY IF EXISTS "labo_tenant_json_ins" ON public.labo_data;
DROP POLICY IF EXISTS "labo_tenant_json_upd" ON public.labo_data;
DROP POLICY IF EXISTS "labo_tenant_json_del" ON public.labo_data;
DROP POLICY IF EXISTS "suivi_public_read" ON public.labo_data;
DROP POLICY IF EXISTS "deny_anon_write" ON public.labo_data;

-- Ligne principale du labo : id = UUID utilisateur Auth
CREATE POLICY "labo_own_row" ON public.labo_data
  FOR ALL
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- Données liées au labo via data.labUserId (portal_*, orders_*, chat_*, stripe_connect_*, etc.)
-- LECTURE : le labo peut lire toutes ses lignes (y compris sa ligne d'abonnement sub_*).
CREATE POLICY "labo_tenant_json_read" ON public.labo_data
  FOR SELECT
  USING (
    (data->>'labUserId') IS NOT NULL
    AND (data->>'labUserId') = auth.uid()::text
  );

-- ÉCRITURE : le labo peut écrire ses lignes SAUF la ligne d'abonnement (sub_*).
-- L'état d'abonnement/essai est géré uniquement côté serveur (service role + webhook Stripe),
-- sinon un utilisateur pouvait prolonger son essai / contourner le paywall via un PATCH direct.
CREATE POLICY "labo_tenant_json_ins" ON public.labo_data
  FOR INSERT
  WITH CHECK (
    (data->>'labUserId') IS NOT NULL
    AND (data->>'labUserId') = auth.uid()::text
    AND id NOT LIKE 'sub\_%'
  );

CREATE POLICY "labo_tenant_json_upd" ON public.labo_data
  FOR UPDATE
  USING (
    (data->>'labUserId') IS NOT NULL
    AND (data->>'labUserId') = auth.uid()::text
    AND id NOT LIKE 'sub\_%'
  )
  WITH CHECK (
    (data->>'labUserId') IS NOT NULL
    AND (data->>'labUserId') = auth.uid()::text
    AND id NOT LIKE 'sub\_%'
  );

CREATE POLICY "labo_tenant_json_del" ON public.labo_data
  FOR DELETE
  USING (
    (data->>'labUserId') IS NOT NULL
    AND (data->>'labUserId') = auth.uid()::text
    AND id NOT LIKE 'sub\_%'
  );

-- Suivi patient public en lecture seule (optionnel — retirer si non utilisé)
CREATE POLICY "suivi_public_read" ON public.labo_data
  FOR SELECT
  USING (id LIKE 'suivi_%');

-- Les écritures cabinet passent par Netlify (service role), pas par anon.
