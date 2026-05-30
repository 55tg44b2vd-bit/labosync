const { buildCors, verifySupabaseUser } = require('./_labosync-auth');
const { requireLabPerm } = require('./_labosync-rbac');

exports.handler = async (event) => {
  const headers = buildCors(event);
  headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  const user = await verifySupabaseUser(event);
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Connexion requise' }) };
  }

  const perm = requireLabPerm(user, 'action:billing_email');
  if (!perm.ok) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: perm.error, code: perm.code }) };
  }

  const RESEND_KEY = (process.env.RESEND_API_KEY || '').trim();
  if (!RESEND_KEY) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: 'RESEND_API_KEY non configurée', code: 'RESEND_NOT_CONFIGURED' }),
    };
  }

  let body;
  try { body = JSON.parse(event.body); } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const { to, subject, html, fromName } = body;
  if (!to || !subject || !html) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Champs manquants : to, subject, html' }) };
  }

  // Expéditeur : domaine vérifié dans Resend (variable RESEND_FROM sur Netlify)
  const fromEmail = (process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL || 'factures@labosync.app').trim();
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
