/**
 * Envoie une notification test à l'external_id fourni (vérifie toute la chaîne).
 * POST { externalId: "lab:..." }
 */
const { buildCors, verifySupabaseUser } = require('./_labosync-auth');
const { sendToExternalUsers, isConfigured, formatOnesignalApiError } = require('./_onesignal');

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

  const playerIds = []
    .concat(body.playerId || body.playerIds || [])
    .filter(Boolean)
    .map(String);
  const subscriptionIds = []
    .concat(body.subscriptionId || body.subscriptionIds || [])
    .filter(Boolean)
    .map(String);

  const result = await sendToExternalUsers({
    externalUserIds: [externalId],
    playerIds,
    subscriptionIds,
    heading: 'Test Labosync',
    body: 'Si vous voyez ceci, les notifications push fonctionnent.',
    url: (process.env.URL || 'https://labosync.app').replace(/\/$/, '') + '/app.html',
    data: { kind: 'test' },
  });

  if (result.ok) {
    const n = result.recipients;
    if (n == null || n === 0) {
      result.ok = false;
      result.reason = 'zero_recipients';
      result.message =
        'OneSignal n\'a joint aucun appareil. Menu ⚙️ → Finaliser l\'enregistrement, puis réessayez.';
    } else {
      result.message = 'Notification envoyée à ' + n + ' appareil(s).';
    }
  } else {
    result.message =
      result.hint ||
      formatOnesignalApiError(result.error, 'Aucun appareil enregistré — menu Finaliser l\'enregistrement d\'abord.');
  }

  return {
    statusCode: result.ok ? 200 : 502,
    headers,
    body: JSON.stringify(result),
  };
};
