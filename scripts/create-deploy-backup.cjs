/**
 * Snapshot Supabase avant déploiement Netlify.
 *
 * Objectif : un déploiement ne doit jamais être le seul point de non-retour.
 * Ce script copie les lignes de labo_data dans des lignes backup_deploy_* avant
 * publication, puis conserve les N derniers snapshots.
 */
const crypto = require('crypto');

const SB_URL = (process.env.SUPABASE_URL || 'https://ljnfpslgwgagdisixuxz.supabase.co').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const KEEP = Math.max(1, parseInt(process.env.DEPLOY_BACKUP_KEEP || '30', 10) || 30);
const BATCH_SIZE = Math.max(1, Math.min(100, parseInt(process.env.DEPLOY_BACKUP_BATCH_SIZE || '25', 10) || 25));

const args = process.argv.slice(2);
const required = args.includes('--required');
const listOnly = args.includes('--list');
const restoreIdx = args.indexOf('--restore');
const restoreBackupId = restoreIdx >= 0 ? String(args[restoreIdx + 1] || '').trim() : '';
const confirmIdx = args.indexOf('--confirm');
const confirmValue = confirmIdx >= 0 ? String(args[confirmIdx + 1] || '').trim() : '';
const reasonIdx = args.indexOf('--reason');
const reason = reasonIdx >= 0 ? String(args[reasonIdx + 1] || '').trim() : 'manual';

function fail(message) {
  console.error('deploy-backup: ' + message);
  process.exit(1);
}

function skip(message) {
  console.warn('deploy-backup: ' + message);
  process.exit(0);
}

if (!SERVICE_KEY) {
  if (required) fail('SUPABASE_SERVICE_KEY manquant, sauvegarde pré-déploiement impossible.');
  skip('SUPABASE_SERVICE_KEY manquant, opération ignorée hors mode obligatoire.');
}

const authHeaders = {
  apikey: SERVICE_KEY,
  Authorization: 'Bearer ' + SERVICE_KEY,
};

function backupIdNow() {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const ref = process.env.COMMIT_REF || process.env.HEAD || process.env.BRANCH || String(Date.now());
  const short = crypto.createHash('sha1').update(ref).digest('hex').slice(0, 8);
  return stamp + '_' + short;
}

function rowHash(id) {
  return crypto.createHash('sha1').update(String(id || '')).digest('hex').slice(0, 16);
}

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

async function sbFetch(path, opts) {
  const r = await fetch(SB_URL + '/rest/v1/' + path, opts || {});
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`${opts && opts.method ? opts.method : 'GET'} ${path} -> HTTP ${r.status} ${txt}`);
  }
  return r;
}

async function readAllRows() {
  const pageSize = 1000;
  let offset = 0;
  const rows = [];
  while (true) {
    const r = await sbFetch(
      `labo_data?select=id,data,updated_at&order=updated_at.asc&limit=${pageSize}&offset=${offset}`,
      { headers: authHeaders }
    );
    const batch = await r.json();
    const safeBatch = Array.isArray(batch) ? batch : [];
    rows.push(...safeBatch.filter((row) => row && row.id && !String(row.id).startsWith('backup_deploy_')));
    if (safeBatch.length < pageSize) break;
    offset += pageSize;
  }
  return rows;
}

async function upsertRows(rows) {
  if (!rows.length) return;
  try {
    await sbFetch('labo_data', {
      method: 'POST',
      headers: Object.assign({}, authHeaders, {
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      }),
      body: JSON.stringify(rows),
    });
  } catch (e) {
    if (rows.length === 1) throw e;
    const mid = Math.ceil(rows.length / 2);
    await upsertRows(rows.slice(0, mid));
    await upsertRows(rows.slice(mid));
  }
}

async function readManifests(limit) {
  const q = `labo_data?id=like.backup_deploy_*_manifest&select=id,data,updated_at&order=updated_at.desc&limit=${limit || 100}`;
  const r = await sbFetch(q, { headers: authHeaders });
  const rows = await r.json();
  return (Array.isArray(rows) ? rows : []).filter((row) => row && row.data && row.data.kind === 'deploy_backup_manifest');
}

async function pruneOldBackups() {
  const manifests = await readManifests(200);
  const old = manifests.slice(KEEP);
  for (const row of old) {
    const bid = row.data && row.data.backupId;
    if (!bid || !/^[0-9TZ_a-f0-9]+$/i.test(bid)) continue;
    await sbFetch(`labo_data?id=like.backup_deploy_${bid}_*`, {
      method: 'DELETE',
      headers: Object.assign({}, authHeaders, { Prefer: 'return=minimal' }),
    });
    console.log(`deploy-backup: ancien snapshot supprimé ${bid}`);
  }
}

async function createBackup() {
  const backupId = backupIdNow();
  const createdAt = new Date().toISOString();
  const sourceRows = await readAllRows();
  const backupRows = sourceRows.map((row) => ({
    id: `backup_deploy_${backupId}_${rowHash(row.id)}`,
    data: {
      kind: 'deploy_backup_row',
      backupId,
      sourceId: row.id,
      sourceUpdatedAt: row.updated_at || null,
      rowData: row.data || {},
      createdAt,
    },
    updated_at: createdAt,
  }));

  for (const part of chunk(backupRows, BATCH_SIZE)) {
    await upsertRows(part);
  }

  const manifest = {
    id: `backup_deploy_${backupId}_manifest`,
    data: {
      kind: 'deploy_backup_manifest',
      backupId,
      createdAt,
      reason,
      rowCount: sourceRows.length,
      keep: KEEP,
      context: {
        netlify: !!process.env.NETLIFY,
        context: process.env.CONTEXT || '',
        branch: process.env.BRANCH || '',
        commitRef: process.env.COMMIT_REF || '',
        deployId: process.env.DEPLOY_ID || '',
      },
      sourceIds: sourceRows.map((row) => row.id),
    },
    updated_at: createdAt,
  };
  await upsertRows([manifest]);
  await pruneOldBackups();
  console.log(`deploy-backup: snapshot ${backupId} créé (${sourceRows.length} lignes, conservation ${KEEP})`);
}

async function listBackups() {
  const manifests = await readManifests(50);
  if (!manifests.length) {
    console.log('deploy-backup: aucun snapshot trouvé');
    return;
  }
  manifests.forEach((row) => {
    const d = row.data || {};
    console.log(`${d.backupId} | ${d.createdAt || row.updated_at} | ${d.rowCount || 0} lignes | ${d.reason || ''}`);
  });
}

async function readBackupRows(backupId) {
  const pageSize = 1000;
  let offset = 0;
  const out = [];
  while (true) {
    const r = await sbFetch(
      `labo_data?id=like.backup_deploy_${encodeURIComponent(backupId)}_*&select=id,data,updated_at&limit=${pageSize}&offset=${offset}`,
      { headers: authHeaders }
    );
    const batch = await r.json();
    const safeBatch = Array.isArray(batch) ? batch : [];
    out.push(...safeBatch.filter((row) => row && row.data && row.data.kind === 'deploy_backup_row'));
    if (safeBatch.length < pageSize) break;
    offset += pageSize;
  }
  return out;
}

async function restoreBackup(backupId) {
  if (!backupId) fail('utilisation: node scripts/create-deploy-backup.cjs --restore <backupId> --confirm RESTORE_<backupId>');
  if (confirmValue !== 'RESTORE_' + backupId) {
    fail(`confirmation requise: --confirm RESTORE_${backupId}`);
  }
  const backupRows = await readBackupRows(backupId);
  if (!backupRows.length) fail('snapshot introuvable ou vide: ' + backupId);
  const now = new Date().toISOString();
  const rows = backupRows.map((row) => ({
    id: row.data.sourceId,
    data: row.data.rowData || {},
    updated_at: now,
  }));
  for (const part of chunk(rows, BATCH_SIZE)) {
    await upsertRows(part);
  }
  console.log(`deploy-backup: snapshot ${backupId} restauré (${rows.length} lignes).`);
}

(async function main() {
  if (listOnly) {
    await listBackups();
    return;
  }
  if (restoreIdx >= 0) {
    await restoreBackup(restoreBackupId);
    return;
  }
  await createBackup();
})().catch((e) => fail(e && e.message ? e.message : String(e)));
