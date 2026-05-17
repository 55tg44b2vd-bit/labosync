const SB_URL = 'https://ljnfpslgwgagdisixuxz.supabase.co';
const { signPortalToken } = require('./_labosync-auth');

const normPortalId = (portalId) => String(portalId || '').trim().toLowerCase();

const portalIdFromRowId = (rowId) => String(rowId || '').replace(/^portal_/i, '');

const isValidPortalId = (portalId) => /^[a-zA-Z0-9_-]{4,120}$/.test(portalId);

const cabLoginRowId = (code) => 'cablogin_' + String(code || '').trim().toUpperCase();

function sanitizeSbError(status, txt) {
  if (txt && (txt.includes('<!DOCTYPE') || txt.includes('<html'))) {
    return 'Service temporairement indisponible. Réessayez dans quelques instants.';
  }
  try {
    const j = JSON.parse(txt);
    if (j.message) return String(j.message).slice(0, 200);
    if (j.error) return String(j.error).slice(0, 200);
  } catch (_) {}
  if (txt && txt.length < 180 && !txt.includes('<')) return txt;
  return 'Connexion impossible pour le moment (erreur ' + status + ').';
}

async function sbFetch(path, serviceKey) {
  const resp = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(sanitizeSbError(resp.status, txt));
  }
  return resp.json();
}

async function readPortalRow(portalId, serviceKey) {
  const normalized = normPortalId(portalId);
  const candidates = [];
  if (normalized) candidates.push('portal_' + normalized);
  const legacy = 'portal_' + String(portalId || '').trim();
  if (legacy && !candidates.includes(legacy)) candidates.push(legacy);

  for (const rowId of candidates) {
    const rows = await sbFetch(
      `labo_data?id=eq.${encodeURIComponent(rowId)}&select=id,data,updated_at`,
      serviceKey
    );
    if (rows && rows.length && rows[0].data) {
      return { row: rows[0], portalId: portalIdFromRowId(rows[0].id) };
    }
  }
  return null;
}

async function resolvePortalIdFromCode(code, serviceKey) {
  const lookupId = cabLoginRowId(code);
  const lookupRows = await sbFetch(
    `labo_data?id=eq.${encodeURIComponent(lookupId)}&select=data`,
    serviceKey
  );
  if (lookupRows && lookupRows.length && lookupRows[0].data && lookupRows[0].data.portalId) {
    return String(lookupRows[0].data.portalId).trim();
  }

  // Anciens portails sans index cablogin_ : recherche par code JSON (sans filtre like qui fait planter l'API)
  const rows = await sbFetch(
    `labo_data?data->>cabCode=eq.${encodeURIComponent(code)}&select=id,data,updated_at&limit=15`,
    serviceKey
  );
  if (!rows || !rows.length) return null;
  const portalRows = rows.filter((r) => /^portal_/i.test(String(r.id || '')));
  if (!portalRows.length) return null;
  if (portalRows.length === 1) return portalIdFromRowId(portalRows[0].id);
  return null;
}

async function findPortalByCredentials(code, pwd, serviceKey) {
  const portalId = await resolvePortalIdFromCode(code, serviceKey);
  if (!portalId) return null;

  const found = await readPortalRow(portalId, serviceKey);
  if (!found) return null;

  const raw = found.row.data || {};
  const storedCode = String(raw.cabCode || '').trim().toUpperCase();
  const storedPwd = String(raw.cabPwd || '').trim();
  if (storedCode !== code || storedPwd !== pwd) return null;

  return found;
}

function authFailure() {
  return { statusCode: 401, body: { error: 'Code ou mot de passe incorrect' } };
}

exports.handler = async (event) => {
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const reqOrigin = event.headers.origin || event.headers.Origin || '';
  const allowOrigin = allowedOrigins.length
    ? (allowedOrigins.includes(reqOrigin) ? reqOrigin : allowedOrigins[0])
    : '*';

  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }
  if (!SERVICE_KEY) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: 'Configuration locale incomplète: SUPABASE_SERVICE_KEY requis pour la connexion cabinet',
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const portalIdInput = String(body.portalId || '').trim();
  const code = String(body.code || '').trim().toUpperCase();
  const pwd = String(body.pwd || '').trim();
  if (!code || !pwd) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Identifiants manquants' }) };
  }

  try {
    let found = null;

    if (portalIdInput && isValidPortalId(portalIdInput)) {
      found = await readPortalRow(portalIdInput, SERVICE_KEY);
      if (!found) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Portail introuvable' }) };
      }
      const raw = found.row.data || {};
      const storedCode = String(raw.cabCode || '').trim().toUpperCase();
      const storedPwd = String(raw.cabPwd || '').trim();
      if (storedCode !== code || storedPwd !== pwd) {
        const fail = authFailure();
        return { statusCode: fail.statusCode, headers, body: JSON.stringify(fail.body) };
      }
    } else {
      found = await findPortalByCredentials(code, pwd, SERVICE_KEY);
      if (!found) {
        const fail = authFailure();
        return { statusCode: fail.statusCode, headers, body: JSON.stringify(fail.body) };
      }
    }

    const sanitized = Object.assign({}, found.row.data || {});
    delete sanitized.cabPwd;

    const portalToken = signPortalToken(found.portalId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        portalId: found.portalId,
        portalToken,
        updatedAt: found.row.updated_at || null,
        portalData: sanitized,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message || 'Erreur serveur' }),
    };
  }
};
