/**
 * Envoie une notification test à l'external_id fourni (vérifie toute la chaîne).
 * POST { externalId: "lab:..." }
 */
const { buildCors, verifySupabaseUser } = require('./_labosync-auth');
const { sendToExternalUsers, isConfigured } = require('./_onesignal');

exports.handler = async (event) => {
  const headers = buildCors(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST uniquement' }) };
  }

  const user = await verifySupabaseUser(event);
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Connexion requise' }) };
  }

  if (!isConfigured()) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'OneSignal non configuré' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const externalId = String(body.externalId || 'lab:' + user.id).trim();
  if (!externalId.startsWith('lab:') && !externalId.startsWith('cabinet:')) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'externalId invalide' }) };
  }

  const result = await sendToExternalUsers({
    externalUserIds: [externalId],
    heading: 'Test Labosync',
    body: 'Si vous voyez ceci, les notifications push fonctionnent.',
    url: (process.env.URL || 'https://labosync.app').replace(/\/$/, '') + '/app.html',
    data: { kind: 'test' },
  });

  return {
    statusCode: result.ok ? 200 : 502,
    headers,
    body: JSON.stringify(result),
  };
};
