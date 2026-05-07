exports.handler = async (event) => {
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

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'RESEND_API_KEY non configurée' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const { to, subject, html, fromName } = body;
  if (!to || !subject || !html) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Champs manquants : to, subject, html' }) };
  }

  // Expéditeur : doit être un domaine vérifié dans Resend
  // Remplacez "labosync.app" par votre domaine vérifié si besoin
  const fromEmail = 'noreply@labosync.app';
  const fromLabel = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromLabel,
      to: [to],
      subject,
      html,
    }),
  });

  const result = await resp.json();

  if (!resp.ok) {
    console.error('Resend error:', result);
    return { statusCode: 500, headers, body: JSON.stringify({ error: result.message || 'Échec envoi email' }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id: result.id }) };
};
