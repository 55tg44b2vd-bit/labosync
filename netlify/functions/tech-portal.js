/* Portail technicien — connexion + prog du jour + coches en direct.
   Lignes labo_data (toutes portent data.labUserId → lisibles par le labo via RLS) :
   - techlogin_<CODE>     : identifiants d'un technicien (écrit par le desktop du labo)
   - techprog_<labUserId> : graphe de prog publié par le labo (jobs + étapes + tâches libres)
   - techlive_<labUserId> : coches / notes / tâches ajoutées par les techniciens (écrit ICI,
                            en lecture directe côté desktop qui les réintègre dans ses jobs) */
const {
  SB_URL,
  buildCors,
  signTechToken,
  verifyTechToken,
} = require('./_labosync-auth');

const MAX_TEXT = 500;
const MAX_LABEL = 120;
const MAX_ADDED = 300;
const MAX_KEYS = 4000;

const techLoginRowId = (code) => 'techlogin_' + String(code || '').trim().toUpperCase();

function clampStr(v, n) {
  return String(v == null ? '' : v).slice(0, n);
}

function sbHeaders(serviceKey, extra) {
  return Object.assign(
    { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    extra || {}
  );
}

async function readRow(rowId, serviceKey) {
  const r = await fetch(
    `${SB_URL}/rest/v1/labo_data?id=eq.${encodeURIComponent(rowId)}&select=data,updated_at`,
    { headers: sbHeaders(serviceKey) }
  );
  if (!r.ok) throw new Error('Lecture indisponible (' + r.status + ')');
  const rows = await r.json();
  return rows && rows[0] ? rows[0] : null;
}

async function upsertRow(rowId, data, serviceKey) {
  const r = await fetch(`${SB_URL}/rest/v1/labo_data`, {
    method: 'POST',
    headers: sbHeaders(serviceKey, {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }),
    body: JSON.stringify({ id: rowId, data, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error('Écriture indisponible : ' + txt.slice(0, 180));
  }
}

function emptyLive(labUserId) {
  return { labUserId, checks: {}, gtChecks: {}, notes: {}, added: [] };
}

function normalizeLive(raw, labUserId) {
  const live = raw && typeof raw === 'object' ? raw : {};
  return {
    labUserId,
    checks: live.checks && typeof live.checks === 'object' ? live.checks : {},
    gtChecks: live.gtChecks && typeof live.gtChecks === 'object' ? live.gtChecks : {},
    notes: live.notes && typeof live.notes === 'object' ? live.notes : {},
    added: Array.isArray(live.added) ? live.added : [],
  };
}

/** Garde les maps de coches sous contrôle : purge les entrées les plus anciennes. */
function pruneMap(map, max) {
  const keys = Object.keys(map);
  if (keys.length <= max) return map;
  keys
    .sort((a, b) => (map[a].rev || 0) - (map[b].rev || 0))
    .slice(0, keys.length - max)
    .forEach((k) => delete map[k]);
  return map;
}

async function stateBundle(labUserId, serviceKey) {
  const [progRow, liveRow] = await Promise.all([
    readRow('techprog_' + labUserId, serviceKey),
    readRow('techlive_' + labUserId, serviceKey),
  ]);
  return {
    graph: progRow && progRow.data ? progRow.data.graph || null : null,
    graphAt: progRow ? progRow.updated_at || null : null,
    live: normalizeLive(liveRow && liveRow.data, labUserId),
    liveAt: liveRow ? liveRow.updated_at || null : null,
  };
}

function getTechTokenFromEvent(event) {
  const hdr = event.headers || {};
  const lower = {};
  Object.keys(hdr).forEach((k) => {
    lower[String(k).toLowerCase()] = hdr[k];
  });
  return String(lower['x-tech-token'] || '').trim();
}

exports.handler = async (event) => {
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const headers = buildCors(event);
  headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Tech-Token';

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (!SERVICE_KEY) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: 'Configuration incomplète : SUPABASE_SERVICE_KEY requis' }),
    };
  }

  const fail = (status, msg) => ({ statusCode: status, headers, body: JSON.stringify({ error: msg }) });
  const ok = (obj) => ({ statusCode: 200, headers, body: JSON.stringify(obj) });

  // ── GET : état complet (prog publiée + coches en direct) ──────────────────
  if (event.httpMethod === 'GET') {
    const auth = verifyTechToken(getTechTokenFromEvent(event));
    if (!auth) return fail(401, 'Session expirée — reconnectez-vous.');
    try {
      const bundle = await stateBundle(auth.labUserId, SERVICE_KEY);
      return ok(bundle);
    } catch (e) {
      return fail(500, e.message || 'Lecture impossible');
    }
  }

  if (event.httpMethod !== 'POST') return fail(405, 'Méthode non autorisée');

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return fail(400, 'JSON invalide');
  }
  const action = String(body.action || '');

  // ── Connexion technicien ───────────────────────────────────────────────────
  if (action === 'login') {
    const code = String(body.code || '').trim().toUpperCase();
    const pwd = String(body.pwd || '').trim();
    if (!code || !pwd) return fail(400, 'Identifiant et mot de passe requis.');
    if (!/^[A-Z0-9-]{4,40}$/.test(code)) return fail(401, 'Identifiant ou mot de passe incorrect');
    try {
      const row = await readRow(techLoginRowId(code), SERVICE_KEY);
      const d = row && row.data ? row.data : null;
      if (!d || !d.labUserId || !d.techKey) return fail(401, 'Identifiant ou mot de passe incorrect');
      if (d.enabled === false) return fail(403, 'Accès désactivé par le laboratoire.');
      if (String(d.pwd || '').trim() !== pwd) return fail(401, 'Identifiant ou mot de passe incorrect');

      const labUserId = String(d.labUserId);
      const bundle = await stateBundle(labUserId, SERVICE_KEY);
      const techs = bundle.graph && bundle.graph.techs ? bundle.graph.techs : {};
      const techInfo = techs[d.techKey] || {};
      return ok(
        Object.assign(
          {
            token: signTechToken(labUserId, d.techKey),
            tech: {
              key: d.techKey,
              label: techInfo.label || d.label || d.techKey,
              color: techInfo.color || '#1a4a7a',
            },
            labName: (bundle.graph && bundle.graph.labName) || '',
          },
          bundle
        )
      );
    } catch (e) {
      return fail(500, e.message || 'Connexion impossible pour le moment');
    }
  }

  // ── Actions authentifiées par jeton technicien ─────────────────────────────
  const auth = verifyTechToken(getTechTokenFromEvent(event));
  if (!auth) return fail(401, 'Session expirée — reconnectez-vous.');
  const labUserId = auth.labUserId;
  const rowId = 'techlive_' + labUserId;

  const writeActions = ['check', 'gtcheck', 'note', 'addtask', 'deltask'];
  if (!writeActions.includes(action)) return fail(400, 'Action inconnue');

  try {
    const row = await readRow(rowId, SERVICE_KEY);
    const live = row && row.data ? normalizeLive(row.data, labUserId) : emptyLive(labUserId);
    const rev = Date.now();
    const by = auth.techKey;

    if (action === 'check') {
      const jobId = clampStr(body.jobId, 80);
      const idx = parseInt(body.idx, 10);
      if (!jobId || !(idx >= 0)) return fail(400, 'Données manquantes');
      live.checks[jobId + '|' + idx] = { done: !!body.done, by, at: new Date().toISOString(), rev };
      pruneMap(live.checks, MAX_KEYS);
    } else if (action === 'gtcheck') {
      const id = clampStr(body.id, 80);
      if (!id) return fail(400, 'Données manquantes');
      live.gtChecks[id] = { done: !!body.done, by, at: new Date().toISOString(), rev };
      pruneMap(live.gtChecks, MAX_KEYS);
    } else if (action === 'note') {
      const jobId = clampStr(body.jobId, 80);
      const idx = parseInt(body.idx, 10);
      if (!jobId || !(idx >= 0)) return fail(400, 'Données manquantes');
      live.notes[jobId + '|' + idx] = { text: clampStr(body.text, MAX_TEXT), by, at: new Date().toISOString(), rev };
      pruneMap(live.notes, MAX_KEYS);
    } else if (action === 'addtask') {
      const label = clampStr(body.label, MAX_LABEL).trim();
      if (!label) return fail(400, 'Libellé requis');
      if (live.added.length >= MAX_ADDED) live.added = live.added.slice(-(MAX_ADDED - 1));
      live.added.push({
        id: 'tt_' + rev + '_' + Math.random().toString(36).slice(2, 8),
        label,
        note: clampStr(body.note, MAX_TEXT),
        tech: by,
        dueDate: clampStr(body.dueDate, 30) || new Date().toISOString(),
        by,
        at: new Date().toISOString(),
        rev,
      });
    } else if (action === 'deltask') {
      const id = clampStr(body.id, 80);
      // Un technicien ne retire que ses propres tâches ajoutées.
      live.added = live.added.filter((t) => !(t.id === id && t.by === by));
    }

    await upsertRow(rowId, live, SERVICE_KEY);
    return ok({ ok: true, rev, live });
  } catch (e) {
    return fail(500, e.message || 'Écriture impossible');
  }
};
