const { normalizeClientError, saveClientError, maybeFireErrorAlert } = require('./_error-dashboard');

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
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  if (!SERVICE_KEY) return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const payload = normalizeClientError(body);

  try {
    await saveClientError(SERVICE_KEY, payload);
    maybeFireErrorAlert(SERVICE_KEY).catch(function (e) {
      console.warn('[log-client-error] alert', e.message || e);
    });
  } catch (_) {
    // Ne jamais casser l'UX côté client pour un échec de log.
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
};
