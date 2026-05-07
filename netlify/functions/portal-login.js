exports.handler = async (event) => {
  const SB_URL = 'https://ljnfpslgwgagdisixuxz.supabase.co';
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
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  if (!SERVICE_KEY) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Clé serveur non configurée' }) };

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const portalId = String(body.portalId || '').trim();
  const code = String(body.code || '').trim().toUpperCase();
  const pwd = String(body.pwd || '').trim();
  if (!/^[a-zA-Z0-9_-]{4,120}$/.test(portalId)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'portalId invalide' }) };
  }
  if (!code || !pwd) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Identifiants manquants' }) };
  }

  const resp = await fetch(`${SB_URL}/rest/v1/labo_data?id=eq.portal_${portalId}&select=data,updated_at`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
  });
  if (!resp.ok) {
    const txt = await resp.text();
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Lecture portail échouée : ' + txt }) };
  }
  const rows = await resp.json();
  if (!rows || !rows.length || !rows[0].data) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Portail introuvable' }) };
  }

  const raw = rows[0].data || {};
  const storedCode = String(raw.cabCode || '').trim().toUpperCase();
  const storedPwd = String(raw.cabPwd || '').trim();
  if (storedCode !== code || storedPwd !== pwd) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Code ou mot de passe incorrect' }) };
  }

  const sanitized = Object.assign({}, raw);
  delete sanitized.cabPwd;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      portalId,
      updatedAt: rows[0].updated_at || null,
      portalData: sanitized,
    }),
  };
};
