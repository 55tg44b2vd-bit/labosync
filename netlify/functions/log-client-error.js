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
  if (!SERVICE_KEY) return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const payload = {
    level: String(body.level || 'error').slice(0, 20),
    app: String(body.app || 'unknown').slice(0, 40),
    message: String(body.message || '').slice(0, 5000),
    stack: String(body.stack || '').slice(0, 12000),
    page: String(body.page || '').slice(0, 500),
    userId: String(body.userId || '').slice(0, 120),
    traceId: String(body.traceId || '').slice(0, 120),
    createdAt: new Date().toISOString(),
  };

  try {
    await fetch(`${SB_URL}/rest/v1/labo_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        data: payload,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (_) {
    // Ne jamais casser l'UX côté client pour un échec de log.
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
};
