/**
 * OneSignal push (Web/PWA). Variables Netlify :
 *   ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY
 */
const ONESIGNAL_API = 'https://api.onesignal.com/notifications';

function isConfigured() {
  return !!(process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_API_KEY);
}

function trimPreview(text, maxLen) {
  const s = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) return '';
  return s.length <= maxLen ? s : s.slice(0, maxLen - 1) + '…';
}

async function sendToExternalUsers({ externalUserIds, heading, body, url, data }) {
  if (!isConfigured()) return { ok: false, skipped: true, reason: 'not_configured' };
  const ids = [...new Set((externalUserIds || []).map((id) => String(id || '').trim()).filter(Boolean))];
  if (!ids.length) return { ok: false, skipped: true, reason: 'no_targets' };

  const payload = {
    app_id: process.env.ONESIGNAL_APP_ID,
    include_aliases: { external_id: ids },
    target_channel: 'push',
    headings: { fr: heading, en: heading },
    contents: { fr: body, en: body },
    data: data || {},
  };
  if (url) payload.url = url;

  const resp = await fetch(ONESIGNAL_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Key ' + process.env.ONESIGNAL_REST_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const txt = await resp.text();
  let json = null;
  try {
    json = txt ? JSON.parse(txt) : null;
  } catch (_) {
    json = { raw: txt };
  }

  if (!resp.ok) {
    console.warn('[onesignal] send failed', resp.status, JSON.stringify(json));
    return { ok: false, status: resp.status, error: json };
  }
  const noDelivery =
    json &&
    ((Array.isArray(json.errors) && json.errors.length > 0) ||
      (Array.isArray(json.invalid_external_user_ids) && json.invalid_external_user_ids.length > 0) ||
      (json.invalid_aliases &&
        Array.isArray(json.invalid_aliases.external_id) &&
        json.invalid_aliases.external_id.length > 0));
  if (noDelivery) {
    console.warn('[onesignal] no recipients', JSON.stringify(json));
    return {
      ok: false,
      status: resp.status,
      error: json,
      reason: 'no_subscribed_devices',
      hint:
        'Aucun appareil abonné pour cet identifiant. Ouvrez Labosync, cliquez « Activer les notifications » (pas seulement le cadenas du navigateur).',
    };
  }
  console.log('[onesignal] sent', ids.join(','), json?.id || '');
  return { ok: true, result: json };
}

function cabinetExternalId(portalId) {
  return 'cabinet:' + String(portalId || '').trim().toLowerCase();
}

function labExternalId(labUserId) {
  return 'lab:' + String(labUserId || '').trim();
}

function siteOrigin() {
  const fromEnv = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  return 'https://labosync.app';
}

function detectNewlySentInvoices(prevFactures, nextFactures) {
  const prevById = {};
  (prevFactures || []).forEach((f) => {
    if (f && f.id) prevById[f.id] = f;
  });
  const out = [];
  (nextFactures || []).forEach((f) => {
    if (!f || !f.id) return;
    const prev = prevById[f.id];
    const nowSent = f.status === 'envoye' || f.status === 'paye';
    const wasSent = prev && (prev.status === 'envoye' || prev.status === 'paye');
    if (nowSent && !wasSent && (f.type || 'facture') === 'facture') out.push(f);
  });
  return out;
}

async function notifyChatMessage({ sender, portalId, labUserId, senderName, content, laboName }) {
  const origin = siteOrigin();
  const preview = trimPreview(content, 120) || 'Nouveau message';
  const from = trimPreview(senderName, 60) || (sender === 'labo' ? laboName || 'Votre laboratoire' : 'Un cabinet');

  if (sender === 'labo') {
    return sendToExternalUsers({
      externalUserIds: [cabinetExternalId(portalId)],
      heading: (laboName || 'Votre laboratoire') + ' — message',
      body: preview,
      url: origin + '/cabinet.html',
      data: { kind: 'chat', portalId, sender: 'labo' },
    });
  }

  if (sender === 'cabinet' && labUserId) {
    return sendToExternalUsers({
      externalUserIds: [labExternalId(labUserId)],
      heading: from + ' — message',
      body: preview,
      url: origin + '/app.html',
      data: { kind: 'chat', portalId, sender: 'cabinet' },
    });
  }

  return { ok: false, skipped: true, reason: 'no_recipient' };
}

async function notifyInvoice({ portalId, facture, laboName, cabName }) {
  const origin = siteOrigin();
  const num = facture.num || facture.id || '';
  const total =
    typeof facture.total === 'number'
      ? facture.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
      : '';
  const body = total
    ? 'Facture ' + num + ' — ' + total
    : 'Facture ' + num + ' disponible sur votre espace.';

  return sendToExternalUsers({
    externalUserIds: [cabinetExternalId(portalId)],
    heading: (laboName || 'Votre laboratoire') + ' — nouvelle facture',
    body,
    url: origin + '/cabinet.html',
    data: { kind: 'invoice', portalId, factureId: facture.id || null },
  });
}

function parseJson(txt) {
  try {
    return txt ? JSON.parse(txt) : null;
  } catch (_) {
    return { raw: txt };
  }
}

function formatOnesignalApiError(json, fallback) {
  if (!json) return fallback || 'Erreur OneSignal';
  const errors = json.errors;
  if (Array.isArray(errors)) {
    const parts = errors.map((e) => {
      if (typeof e === 'string') return e;
      if (e && typeof e === 'object') return e.title || e.message || e.code || JSON.stringify(e);
      return String(e);
    });
    if (parts.length) return parts.join(' — ');
  }
  if (json.error && typeof json.error === 'string') return json.error;
  return fallback || 'Erreur OneSignal';
}

function legacyDeviceType(pushType) {
  if (pushType === 'FirefoxPush') return 8;
  if (pushType === 'SafariPush' || pushType === 'SafariLegacyPush') return 7;
  return 5;
}

/** API historique /players — souvent plus tolérante que l'API Users seule. */
async function registerLegacyWebPlayer({ externalId, endpoint, auth, p256dh, pushType }) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  const body = {
    app_id: appId,
    device_type: legacyDeviceType(pushType),
    identifier: endpoint,
    external_user_id: externalId,
    web_auth: auth,
    web_p256: p256dh,
    notification_types: 1,
  };

  const authModes = ['Key ' + apiKey, 'Basic ' + apiKey];
  for (const authorization of authModes) {
    const headers = { 'Content-Type': 'application/json', Authorization: authorization };
    const resp = await fetch('https://onesignal.com/api/v1/players', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const json = parseJson(await resp.text());
    if (resp.ok && json && json.id) {
      return { ok: true, result: json, method: 'legacy_players' };
    }

    const listUrl =
      'https://onesignal.com/api/v1/players?app_id=' +
      encodeURIComponent(appId) +
      '&external_user_id=' +
      encodeURIComponent(externalId) +
      '&limit=2';
    const listResp = await fetch(listUrl, { headers: { Authorization: authorization } });
    const listJson = parseJson(await listResp.text());
    const playerId = listJson?.players?.[0]?.id;
    if (playerId) {
      const putResp = await fetch('https://onesignal.com/api/v1/players/' + encodeURIComponent(playerId), {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      const putJson = parseJson(await putResp.text());
      if (putResp.ok) {
        return { ok: true, result: putJson, method: 'legacy_players_update' };
      }
    }
  }

  return { ok: false, reason: 'legacy_failed' };
}

/**
 * Enregistre un abonnement Web Push (Push API) pour un external_id via l'API Users OneSignal.
 */
async function upsertWebPushSubscription({ externalId, endpoint, auth, p256dh, pushType }) {
  if (!isConfigured()) return { ok: false, reason: 'not_configured' };
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  const eid = String(externalId || '').trim();
  const token = String(endpoint || '').trim();
  if (!eid || !token || !auth || !p256dh) {
    return { ok: false, reason: 'invalid_subscription' };
  }

  const type = String(pushType || 'ChromePush').trim() || 'ChromePush';
  const subscription = {
    type,
    token,
    enabled: true,
    notification_types: 1,
    web_auth: auth,
    web_p256: p256dh,
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Key ' + apiKey,
    Accept: 'application/json',
  };

  const createSubUrl =
    'https://api.onesignal.com/apps/' +
    encodeURIComponent(appId) +
    '/users/by/external_id/' +
    encodeURIComponent(eid) +
    '/subscriptions';

  let resp = await fetch(createSubUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ subscription }),
  });
  let json = parseJson(await resp.text());

  if (resp.ok || resp.status === 202) {
    return { ok: true, result: json };
  }

  const userMissing =
    resp.status === 404 ||
    (Array.isArray(json?.errors) &&
      json.errors.some((e) => {
        const t = typeof e === 'object' ? e.title || e.code || '' : String(e);
        return /not found|user/i.test(t);
      }));

  if (userMissing) {
    resp = await fetch('https://api.onesignal.com/apps/' + encodeURIComponent(appId) + '/users', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        identity: { external_id: eid },
        subscriptions: [subscription],
      }),
    });
    json = parseJson(await resp.text());
    if (resp.ok || resp.status === 202) {
      return { ok: true, result: json };
    }
  }

  const legacy = await registerLegacyWebPlayer({
    externalId: eid,
    endpoint: token,
    auth,
    p256dh,
    pushType: type,
  });
  if (legacy.ok) return legacy;

  const message = formatOnesignalApiError(json, 'OneSignal a refusé l\'enregistrement');
  console.warn('[onesignal] upsert subscription', resp.status, JSON.stringify(json));
  return { ok: false, status: resp.status, message, error: json };
}

async function hasLegacyWebPlayer(externalId) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!appId || !apiKey) return false;
  const url =
    'https://onesignal.com/api/v1/players?app_id=' +
    encodeURIComponent(appId) +
    '&external_user_id=' +
    encodeURIComponent(externalId) +
    '&limit=5';
  for (const authorization of ['Key ' + apiKey, 'Basic ' + apiKey]) {
    try {
      const resp = await fetch(url, { headers: { Authorization: authorization } });
      if (!resp.ok) continue;
      const json = parseJson(await resp.text());
      const players = json?.players || [];
      if (
        players.some(
          (p) =>
            p &&
            (p.invalid_identifier === false || p.invalid_identifier == null) &&
            (p.notification_types === 1 || p.notification_types === '1' || p.identifier)
        )
      ) {
        return true;
      }
    } catch (_) {}
  }
  return false;
}

module.exports = {
  isConfigured,
  sendToExternalUsers,
  upsertWebPushSubscription,
  hasLegacyWebPlayer,
  formatOnesignalApiError,
  cabinetExternalId,
  labExternalId,
  detectNewlySentInvoices,
  notifyChatMessage,
  notifyInvoice,
};
