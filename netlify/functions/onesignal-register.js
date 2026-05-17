/**
 * Enregistre un abonnement Web Push navigateur pour l'utilisateur connecté.
 * POST { externalId, endpoint, auth, p256dh }
 */
const {
  buildCors,
  verifySupabaseUser,
  verifyPortalToken,
  getPortalTokenFromEvent,
} = require('./_labosync-auth');
const { upsertWebPushSubscription, isConfigured } = require('./_onesignal');

function labExternalId(userId) {
  return 'lab:' + String(userId || '').trim();
}

function cabinetExternalId(portalId) {
  return 'cabinet:' + String(portalId || '').trim().toLowerCase();
}

async function authorizeExternalId(event, externalId) {
  const eid = String(externalId || '').trim();
  if (!eid) return false;

  const user = await verifySupabaseUser(event);
  if (user) {
    return eid === labExternalId(user.id);
  }

  const portalTok = getPortalTokenFromEvent(event);
  if (portalTok) {
    const payload = verifyPortalToken(portalTok);
    if (!payload) return false;
    return eid === cabinetExternalId(payload.portalId);
  }

  return false;
}

exports.handler = async (event) => {
  const headers = buildCors(event);
  headers['Cache-Control'] = 'no-store';

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST uniquement' }) };
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

  const externalId = String(body.externalId || '').trim();
  const endpoint = String(body.endpoint || '').trim();
  const auth = String(body.auth || '').trim();
  const p256dh = String(body.p256dh || '').trim();
  const pushType = String(body.pushType || 'ChromePush').trim() || 'ChromePush';

  if (!externalId || !endpoint || !auth || !p256dh) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'externalId, endpoint, auth et p256dh requis' }),
    };
  }

  if (!(await authorizeExternalId(event, externalId))) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Non autorisé' }) };
  }

  try {
    const result = await upsertWebPushSubscription({
      externalId,
      endpoint,
      auth,
      p256dh,
      pushType,
    });
    return {
      statusCode: result.ok ? 200 : 502,
      headers,
      body: JSON.stringify({
        ok: result.ok,
        playerId: result.playerId || result.result?.id || null,
        subscriptionId: result.subscriptionId || null,
        method: result.method || null,
        message: result.ok
          ? 'Enregistré' + (result.playerId ? ' (player ' + result.playerId + ')' : '')
          : result.message,
        error: result.ok ? undefined : result.error,
      }),
    };
  } catch (err) {
    console.error('[onesignal-register]', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        message: String(err.message || err),
      }),
    };
  }
};
