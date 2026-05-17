/**
 * Vérifie si un external_id OneSignal a un abonnement Web Push actif.
 * GET ?externalId=lab:uuid ou cabinet:portalId
 */
const { buildCors } = require('./_labosync-auth');
const { getWebPushTargets, countDeliverableTargets } = require('./_onesignal');

const WEB_PUSH_TYPES = new Set([
  'web_push',
  'WebPush',
  'ChromePush',
  'FirefoxPush',
  'SafariPush',
  'SafariLegacyPush',
  'webpush',
]);

function isWebPushSub(sub) {
  if (!sub || typeof sub !== 'object') return false;
  const type = String(sub.type || sub.device_type || '').trim();
  if (type && WEB_PUSH_TYPES.has(type)) return true;
  if (type && /push/i.test(type) && !/mobile|ios|android|email|sms/i.test(type)) return true;
  return !!(sub.token || sub.web_auth || sub.web_p256dh);
}

function isSubscribed(sub) {
  if (!sub) return false;
  if (sub.enabled === false) return false;
  const status = String(sub.status || sub.subscription_status || '').toLowerCase();
  if (status === 'subscribed') return true;
  if (status === 'unsubscribed' || status === 'never subscribed') return false;
  if (sub.enabled === true) return true;
  if (sub.notification_types === 1 || sub.notification_types === '1') return true;
  return isWebPushSub(sub);
}

exports.handler = async (event) => {
  const headers = buildCors(event);
  headers['Cache-Control'] = 'no-store';

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'GET uniquement' }) };
  }

  const externalId = String(event.queryStringParameters?.externalId || '').trim();
  if (!externalId || externalId.length > 200) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'externalId requis' }) };
  }

  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!appId || !apiKey) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ configured: false, registered: false, externalId }),
    };
  }

  try {
    const targets = await getWebPushTargets(externalId);
    const deliverable = countDeliverableTargets(targets);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        configured: true,
        registered: deliverable > 0,
        externalId,
        deliverable,
        subscriptionIds: targets.subscriptionIds,
        playerIds: targets.playerIds,
        activeWebPushCount: deliverable,
      }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        configured: true,
        registered: false,
        externalId,
        reason: 'network_error',
        message: String(err.message || err),
      }),
    };
  }
};
