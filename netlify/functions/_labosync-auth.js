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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

async function verifySupabaseUser(event) {
  const token = getBearerToken(event);
  if (!token) return null;
  const apikey = supabaseAnonKey() || process.env.SUPABASE_SERVICE_KEY;
  if (!apikey) return null;
  try {
    const r = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: {
        apikey,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!r.ok) return null;
    const user = await r.json();
    if (!user || !user.id) return null;
    return user;
  } catch (_) {
    return null;
  }
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
};
