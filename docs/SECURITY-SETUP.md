# Mise en place sécurité Labosync

Ce guide complète le déploiement des correctifs Netlify + clients. À faire **dans l’ordre**.

## 1. Netlify (Site settings → Environment variables)

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `SUPABASE_SERVICE_KEY` | Oui | Clé **service_role** Supabase (jamais dans le front) |
| `SUPABASE_ANON_KEY` ou `SB_PUBLISHABLE_KEY` | Oui | Clé anon / publishable pour vérifier les JWT utilisateur |
| `PORTAL_SESSION_SECRET` | Fortement recommandé | Secret dédié (32+ caractères aléatoires) pour les tokens cabinet |
| `ALLOWED_ORIGINS` | Recommandé | Ex. `https://labosync.app,https://www.labosync.app` |
| `ANTHROPIC_API_KEY` | Si IA | Assistant + import |
| `ADMIN_EMAILS` | Si console admin | Emails autorisés, séparés par des virgules |
| `ADMIN_CONSOLE_SECRET` | Optionnel | Code supplémentaire demandé à la connexion sur `/admin` |
| `ADMIN_REQUIRE_MFA` | Optionnel | `true` pour exiger la MFA Supabase sur le compte admin |
| Clés Stripe | Si paiements | Selon vos fonctions existantes |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Si fichiers STL | Stockage empreintes cabinet → voir [R2-SETUP.md](./R2-SETUP.md) |

Après modification : **Deploys → Trigger deploy** (ou push git).

## 2. Supabase

### 2.1 Exécuter le SQL RLS

1. Ouvrir [Supabase Dashboard](https://supabase.com/dashboard) → projet → **SQL Editor**
2. Coller le contenu de `supabase/rls-labo_data.sql`
3. Exécuter

### 2.2 Vérifier les données existantes

Pour chaque ligne `portal_*`, `orders_*`, `chat_*` utilisée en production, le JSON `data` doit contenir :

```json
"labUserId": "<uuid-du-compte-labo-supabase>"
```

Sans cela, le labo ne pourra plus lire/écrire ces lignes après activation des policies.

**Migration rapide** (à adapter) : pour chaque portail, récupérer l’`id` Auth du labo propriétaire et mettre à jour `data.labUserId` sur `portal_*`, `orders_*`, `chat_*` associés.

### 2.3 Tests

1. Compte labo A : lecture/écriture de sa ligne `id = user.id` et de ses `orders_*`
2. Compte labo B : **aucun** accès aux données de A
3. Cabinet : connexion code/mot de passe → chat et commandes via API Netlify (pas d’écriture directe anon sur `orders_*`)

## 3. Comportement après déploiement

| Acteur | Accès |
|--------|--------|
| Labo (app.html) | JWT Supabase sur REST + fonctions Netlify |
| Cabinet (cabinet.html) | Token `portalToken` → header `X-Portal-Token` sur `portal` |
| IA | `ai-chat` / `ai-import-plan` : JWT labo obligatoire |
| Anon clé publishable | Lecture `suivi_*` seulement (si policy activée) |

## 4. Dépannage

- **401 sur le chat cabinet** : se reconnecter (nouveau `portalToken` après login).
- **403 / vide sur commandes labo** : ajouter `labUserId` dans `data` + vérifier RLS.
- **503 portal** : `SUPABASE_SERVICE_KEY` manquante sur Netlify.
- **IA 401** : utilisateur non connecté ou token expiré.

## 5. Console administrateur (`/admin`)

Page dédiée : `admin-console.html` (alias Netlify `/admin`).

1. Créer un compte Supabase Auth pour l’administrateur (email + mot de passe).
2. Ajouter cet email dans `ADMIN_EMAILS` sur Netlify.
3. (Recommandé) Définir `ADMIN_CONSOLE_SECRET` : code saisi en plus du mot de passe à la connexion.
4. Ouvrir `https://votre-domaine/admin`, se connecter.

**Outils disponibles** : tableau des comptes, file « À traiter », journal d’audit, fiche support (santé du compte, stats labo cloud, erreurs client, tags, prolongation essai, liens auth Stripe, export CSV).

Cette console est **séparée** de l’application labo : pas d’onglet caché dans `app.html`.

## 6. Optionnel

- Configurer Sentry ou surveiller `/.netlify/functions/log-client-error`
- Rotation de `PORTAL_SESSION_SECRET` (invalide les sessions cabinet en cours)
