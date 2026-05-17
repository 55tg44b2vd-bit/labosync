const { buildCors } = require('./_labosync-auth');

let _syncCache = null;
let _syncCacheAt = 0;

async function fetchWebSync(appId) {
  const now = Date.now();
  if (_syncCache && _syncCache.appId === appId && now - _syncCacheAt < 600000) {
    return _syncCache.data;
  }
  try {
    const resp = await fetch(
      'https://onesignal.com/api/v1/sync/' + encodeURIComponent(appId) + '/web',
      { headers: { Accept: 'application/json' } }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    _syncCache = { appId, data };
    _syncCacheAt = now;
    return data;
  } catch (_) {
    return null;
  }
}

exports.handler = async (event) => {
  const headers = buildCors(event);
  headers['Cache-Control'] = 'public, max-age=300';

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  const appId = process.env.ONESIGNAL_APP_ID || '';
  const sync = appId ? await fetchWebSync(appId) : null;
  const cfg = sync && sync.config ? sync.config : {};
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      enabled: !!appId,
      appId,
      vapidPublicKey: cfg.vapid_public_key || '',
      onesignalVapidPublicKey: cfg.onesignal_vapid_public_key || '',
    }),
  };
};
