# Sauvegardes avant déploiement Netlify

Objectif : une mise à jour du site ne doit jamais faire perdre les travaux, la file de programmation, les cabinets, les factures ou les réglages déjà enregistrés.

## Fonctionnement

Avant chaque build Netlify, la commande définie dans `netlify.toml` lance :

```bash
node scripts/create-deploy-backup.cjs --required --reason netlify-build
```

Le script lit la table Supabase `labo_data`, ignore les anciens backups, puis crée un snapshot horodaté dans des lignes `backup_deploy_*`.

Par défaut, les 30 derniers snapshots sont conservés. Pour changer cette limite, définir la variable Netlify :

```text
DEPLOY_BACKUP_KEEP=60
```

## Variables nécessaires

La sauvegarde automatique a besoin de :

```text
SUPABASE_SERVICE_KEY
```

Elle doit déjà être configurée dans Netlify pour les fonctions serveur. Si cette variable manque pendant un déploiement Netlify, le build échoue volontairement au lieu de publier sans sauvegarde.

## Utilisation courante

Pour un déploiement normal, il n'y a rien à faire : le backup se crée automatiquement avant publication.

Pour créer un snapshot manuel depuis votre machine :

```bash
npm run backup:deploy
```

Pour lister les derniers snapshots :

```bash
npm run backup:list
```

Ces commandes nécessitent `SUPABASE_SERVICE_KEY` dans l'environnement local. Sur Windows PowerShell :

```powershell
$env:SUPABASE_SERVICE_KEY="votre_cle_service_role"
npm run backup:list
```

## Restauration en cas d'incident

Lister les snapshots :

```bash
npm run backup:list
```

Restaurer un snapshot précis :

```bash
node scripts/create-deploy-backup.cjs --restore BACKUP_ID --confirm RESTORE_BACKUP_ID
```

Exemple :

```bash
node scripts/create-deploy-backup.cjs --restore 20260520T201500Z_a1b2c3d4 --confirm RESTORE_20260520T201500Z_a1b2c3d4
```

La restauration réécrit les lignes présentes dans le snapshot. Elle ne supprime pas les nouvelles lignes créées après ce snapshot, ce qui limite le risque d'effacement accidentel.

## Important

Ce backup ne remplace pas les protections de synchronisation dans l'app. Les deux sont complémentaires :

- l'app empêche les sauvegardes vides ou suspectes d'écraser le cloud ;
- Netlify crée un snapshot serveur avant de publier une nouvelle version ;
- en cas d'incident, on peut revenir au dernier snapshot sain.
