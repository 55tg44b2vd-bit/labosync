# Messagerie portail Labosync

## Déploiement recommandé (Supabase)

Exécutez le script SQL dans Supabase → SQL Editor :

`supabase/portal-messages.sql`

Cela crée les tables `portal_messages` et `portal_chat_reads`. Sans ce script, la messagerie continue de fonctionner via `labo_data` (format legacy) avec reçus de lecture dans `chat_reads_{portalId}`.

## API

- `GET /.netlify/functions/portal?type=chat&portalId=…` — liste des messages + `reads` + `unread`
- `POST` `{ action: 'chat', portalId, sender, … }` — envoi
- `POST` `{ action: 'chat_mark_read', portalId }` — marquer comme lu (côté labo ou cabinet selon le token)

## Comportement produit

- Les non-lus sont calculés côté serveur (`lab_read_at` / `cabinet_read_at`).
- Après envoi, le labo voit un toast ; utiliser **Prévenir** pour WhatsApp/email.
- Migration automatique des anciens fils JSON vers `portal_messages` au premier chargement (si tables déployées).

## Pièces jointes (R2)

Les fichiers STL/PDF/etc. du chat sont stockés dans **Cloudflare R2** (bucket privé), chemin :

`labs/{labUserId}/portal/{portalId}/chat/{timestamp}_{fichier}`

- Upload : `POST r2-storage` action `prepare_chat_upload`
- Lecture : URL signée (~1 h) générée à chaque chargement du fil
- **Repli** : si R2 n’est pas configuré sur Netlify, retour automatique au bucket Supabase `chat-files` (legacy)

Variables Netlify : `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`  
Optionnel : `R2_CHAT_MAX_FILE_BYTES` (défaut 50 Mo)
