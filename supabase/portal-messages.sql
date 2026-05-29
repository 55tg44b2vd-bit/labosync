-- Labosync — Messagerie portail (à exécuter dans Supabase → SQL Editor)
-- Accès via Netlify (service role). RLS : lecture/écriture refusée aux clients directs.

CREATE TABLE IF NOT EXISTS public.portal_messages (
  id text PRIMARY KEY,
  portal_id text NOT NULL,
  lab_user_id text,
  sender text NOT NULL CHECK (sender IN ('labo', 'cabinet')),
  sender_name text,
  content text NOT NULL DEFAULT '',
  image text,
  attachment jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_messages_portal_created_idx
  ON public.portal_messages (portal_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.portal_chat_reads (
  portal_id text PRIMARY KEY,
  lab_user_id text,
  lab_read_at timestamptz,
  cabinet_read_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_chat_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portal_messages_deny_all" ON public.portal_messages;
CREATE POLICY "portal_messages_deny_all" ON public.portal_messages
  FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "portal_chat_reads_deny_all" ON public.portal_chat_reads;
CREATE POLICY "portal_chat_reads_deny_all" ON public.portal_chat_reads
  FOR ALL USING (false) WITH CHECK (false);
