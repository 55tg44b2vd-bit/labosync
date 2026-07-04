const crypto = require('crypto');

const SB_URL = 'https://ljnfpslgwgagdisixuxz.supabase.co';

function buildCors(event) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const reqOrigin = event.headers.origin || event.headers.Origin || '';
  const allowOrigin = allowedOrigins.length
    ? (allowedOrigins.includes(reqOrigin) ? reqOrigin : allowedOrigins[0])
    : '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Portal-Token',
    'Content-Type': 'application/json',
  };
}

function getBearerToken(event) {
  const auth = event.headers.authorization || event.headers.Authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : '';
}

function supabaseAnonKey() {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.SB_PUBLISHABLE_KEY ||
    ''
  ).trim();
}

function decodeJwtPayload(token) {
  try {
    const part = String(token || '').split('.')[1];
    if (!part) return null;
    const padded = part + '='.repeat((4 - (part.length % 4)) % 4);
    const json = Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
}

async function fetchAdminUser(userId) {
  const key = (process.env.SUPABASE_SERVICE_KEY || '').trim();
  if (!key || !userId) return null;
  try {
    const r = await fetch(`${SB_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!r.ok) return null;
    const user = await r.json();
    return user && user.id ? user : null;
  } catch (_) {
    return null;
  }
}

async function verifySupabaseUser(event) {
  const token = getBearerToken(event);
  if (!token) return null;

  const serviceKey = (process.env.SUPABASE_SERVICE_KEY || '').trim();
  const anonKey = supabaseAnonKey();
  const keys = [];
  if (serviceKey) keys.push(serviceKey);
  if (anonKey && !keys.includes(anonKey)) keys.push(anonKey);

  for (const apikey of keys) {
    try {
      const r = await fetch(`${SB_URL}/auth/v1/user`, {
        headers: {
          apikey,
          Authorization: `Bearer ${token}`,
        },
      });
      if (!r.ok) continue;
      const user = await r.json();
      if (user && user.id) return user;
    } catch (_) {
      /* essayer la clé suivante */
    }
  }

  const payload = decodeJwtPayload(token);
  if (payload && payload.sub) {
    const expMs = payload.exp ? payload.exp * 1000 : Date.now() + 60000;
    if (expMs > Date.now() - 30000) {
      const user = await fetchAdminUser(payload.sub);
      if (user) return user;
    }
  }

  return null;
}

function serviceKey() {
  return process.env.SUPABASE_SERVICE_KEY || '';
}

async function laboDataGet(id) {
  const key = serviceKey();
  if (!key) return null;
  const r = await fetch(`${SB_URL}/rest/v1/labo_data?id=eq.${encodeURIComponent(id)}&select=data,updated_at`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0] || null;
}

async function laboDataUpsert(id, data) {
  const key = serviceKey();
  if (!key) throw new Error('SUPABASE_SERVICE_KEY manquant');
  const r = await fetch(`${SB_URL}/rest/v1/labo_data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id,
      data,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error('Supabase upsert: ' + txt);
  }
}

function connectRowId(userId) {
  return `stripe_connect_${userId}`;
}

async function getStripeConnect(userId) {
  const row = await laboDataGet(connectRowId(userId));
  return row && row.data ? row.data : null;
}

async function saveStripeConnect(userId, data) {
  await laboDataUpsert(connectRowId(userId), Object.assign({}, data, { userId, updatedAt: new Date().toISOString() }));
}

function platformStripeSecret() {
  return (
    process.env.STRIPE_SUBSCRIPTION_KEY ||
    process.env.STRIPE_PLATFORM_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY ||
    ''
  ).trim();
}

function signState(payload) {
  const secret = process.env.STRIPE_CONNECT_STATE_SECRET || process.env.SUPABASE_SERVICE_KEY || 'labosync-connect';
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyState(state) {
  if (!state || typeof state !== 'string') return null;
  const parts = state.split('.');
  if (parts.length !== 2) return null;
  const secret = process.env.STRIPE_CONNECT_STATE_SECRET || process.env.SUPABASE_SERVICE_KEY || 'labosync-connect';
  const expected = crypto.createHmac('sha256', secret).update(parts[0]).digest('base64url');
  if (expected !== parts[1]) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!payload.userId || !payload.ts) return null;
    if (Date.now() - payload.ts > 15 * 60 * 1000) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

function resolveConnectRedirectUri(appUrl) {
  const forced = (process.env.STRIPE_CONNECT_REDIRECT_URI || '').trim();
  if (forced) return forced;
  try {
    const u = new URL(appUrl);
    return `${u.origin}/.netlify/functions/stripe-connect-callback`;
  } catch (_) {
    return 'https://labosync.app/.netlify/functions/stripe-connect-callback';
  }
}

function resolveAppReturnBase(appUrl) {
  try {
    const u = new URL(appUrl);
    if (u.pathname.toLowerCase().includes('labo-mobile')) {
      return `${u.origin}/labo-mobile.html`;
    }
    return `${u.origin}/app.html`;
  } catch (_) {
    return 'https://labosync.app/app.html';
  }
}

function portalSessionSecret() {
  return (
    process.env.PORTAL_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_KEY ||
    'labosync-portal-change-me'
  ).trim();
}

/** Token session cabinet — accès portail + chat pour un portalId. */
function signPortalToken(portalId, ttlMs) {
  const pid = String(portalId || '').trim().toLowerCase();
  if (!pid) return '';
  const ttl = Number(ttlMs) > 0 ? Number(ttlMs) : 4 * 3600 * 1000;
  const payload = { portalId: pid, role: 'cabinet', exp: Date.now() + ttl };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', portalSessionSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

/** Token session technicien — accès au portail atelier d'un labo. */
function signTechToken(labUserId, techKey, ttlMs) {
  const uid = String(labUserId || '').trim();
  const tk = String(techKey || '').trim();
  if (!uid || !tk) return '';
  const ttl = Number(ttlMs) > 0 ? Number(ttlMs) : 14 * 3600 * 1000;
  const payload = { labUserId: uid, techKey: tk, role: 'tech', exp: Date.now() + ttl };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', portalSessionSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyTechToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = crypto.createHmac('sha256', portalSessionSecret()).update(parts[0]).digest('base64url');
  if (expected !== parts[1]) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (payload.role !== 'tech' || !payload.labUserId || !payload.techKey) return null;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

function verifyPortalToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = crypto.createHmac('sha256', portalSessionSecret()).update(parts[0]).digest('base64url');
  if (expected !== parts[1]) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!payload.portalId || !payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

function getPortalTokenFromEvent(event) {
  const hdr = event.headers || {};
  const lower = {};
  Object.keys(hdr).forEach((k) => {
    lower[String(k).toLowerCase()] = hdr[k];
  });
  return String(lower['x-portal-token'] || '').trim();
}

/** Trouve l’UUID Supabase du labo propriétaire d’un portail cabinet (push chat). */
async function findLabUserIdForPortal(portalId) {
  const raw = String(portalId || '').trim();
  const pid = raw.toLowerCase();
  if (!pid) return null;

  const rowIds = [];
  for (const id of [pid, raw]) {
    if (!id) continue;
    rowIds.push('portal_owner_' + id, 'portal_' + id, 'chat_' + id, 'orders_' + id);
  }
  const seen = new Set();
  for (const rowId of rowIds) {
    if (seen.has(rowId)) continue;
    seen.add(rowId);
    const row = await laboDataGet(rowId);
    if (row?.data?.labUserId) return String(row.data.labUserId).trim();
  }

  const key = serviceKey();
  if (!key) return null;
  for (const portalIdValue of [pid, raw]) {
    if (!portalIdValue) continue;
    try {
      const resp = await fetch(
        `${SB_URL}/rest/v1/labo_data?select=id,data&data->>portalId=eq.${encodeURIComponent(portalIdValue)}&limit=12`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } }
      );
      if (!resp.ok) continue;
      const rows = await resp.json();
      for (const r of rows || []) {
        if (r?.data?.labUserId) return String(r.data.labUserId).trim();
      }
    } catch (e) {
      console.warn('[auth] findLabUserIdForPortal', e);
    }
  }

  for (const portalIdValue of [pid, raw]) {
    if (!portalIdValue) continue;
    try {
      const needle = encodeURIComponent(JSON.stringify([{ portalId: portalIdValue }]));
      const resp = await fetch(
        `${SB_URL}/rest/v1/labo_data?select=id,data&data->cabinets=cs.${needle}&limit=5`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } }
      );
      if (!resp.ok) continue;
      const rows = await resp.json();
      for (const r of rows || []) {
        if (r?.data?.labUserId) return String(r.data.labUserId).trim();
        if (/^[0-9a-f-]{36}$/i.test(String(r.id || ''))) return String(r.id).trim();
      }
    } catch (e) {
      console.warn('[auth] findLabUserIdForPortal cabinets', e);
    }
  }

  return null;
}

async function labOwnsPortal(labUserId, portalId) {
  const uid = String(labUserId || '');
  const raw = String(portalId || '').trim();
  const pid = raw.toLowerCase();
  if (!uid || !pid) return false;

  const labRow = await laboDataGet(uid);
  const cabinets = labRow?.data?.cabinets;
  if (Array.isArray(cabinets)) {
    if (cabinets.some((c) => String(c.portalId || '').trim().toLowerCase() === pid)) return true;
    if (cabinets.some((c) => String(c.portalId || '').trim() === raw)) return true;
  }

  const portalRowIds = [];
  if (raw) portalRowIds.push('portal_' + raw);
  const lowerId = 'portal_' + pid;
  if (!portalRowIds.includes(lowerId)) portalRowIds.push(lowerId);

  for (const rowId of portalRowIds) {
    const row = await laboDataGet(rowId);
    if (!row?.data) continue;
    if (row.data.labUserId && String(row.data.labUserId) === uid) return true;
  }

  return false;
}

module.exports = {
  SB_URL,
  buildCors,
  verifySupabaseUser,
  getStripeConnect,
  saveStripeConnect,
  platformStripeSecret,
  signState,
  verifyState,
  resolveConnectRedirectUri,
  resolveAppReturnBase,
  getBearerToken,
  signPortalToken,
  verifyPortalToken,
  signTechToken,
  verifyTechToken,
  getPortalTokenFromEvent,
  labOwnsPortal,
  findLabUserIdForPortal,
  laboDataGet,
  laboDataUpsert,
};
