# Cloudflare R2 — fichiers STL / commandes cabinet

Stockage des empreintes numériques et pièces jointes liées aux **fiches de commande** portail cabinet.

## 1. Créer le bucket R2

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2** → **Create bucket**
2. Nom suggéré : `labosync-files`
3. Laisser le bucket **privé** (pas d’accès public)

## 2. Clés API R2

R2 → **Manage R2 API Tokens** → token avec droits **Object Read & Write** sur ce bucket.

Notez :

- Account ID
- Access Key ID
- Secret Access Key

## 3. Variables Netlify

| Variable | Exemple | Description |
|----------|---------|-------------|
| `R2_ACCOUNT_ID` | `a1b2c3…` | ID compte Cloudflare |
| `R2_ACCESS_KEY_ID` | | Clé API |
| `R2_SECRET_ACCESS_KEY` | | Secret API |
| `R2_BUCKET_NAME` | `labosync-files` | Nom du bucket |
| `R2_ENDPOINT` | (optionnel) | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `R2_MAX_FILE_BYTES` | `157286400` | Max 150 Mo par fichier (optionnel) |

Redéployer le site après ajout.

## 4. CORS sur le bucket (upload direct navigateur)

Dans les paramètres CORS du bucket R2, autoriser votre domaine :

```json
[
  {
    "AllowedOrigins": ["https://labosync.app", "https://www.labosync.app", "http://localhost:8888"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

Adaptez les origines à votre URL Netlify / local.

## 5. Fonctionnement produit

- **Cabinet** : étape 4 de la commande → dépôt STL / OBJ / PLY / ZIP / PDF (max 150 Mo)
- Fichiers stockés sous : `labs/{labUserId}/portal/{portalId}/case/{caseId}/step/{stepId}/…`
- **Laboratoire** : fiche commande + travail créé → téléchargement via URL signée (1 h)

Les métadonnées restent dans Supabase (`orders_*` → `steps[].files[]`), **pas** le binaire.

## 6. Coûts

- Stockage R2 : ~0,015 $/Go-mois
- **Egress gratuit** vers Internet (avantage vs Supabase Storage pour gros STL)
