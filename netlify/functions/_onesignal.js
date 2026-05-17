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
  const token = String(sub.token || sub.identifier || '');
  if (/push\.apple\.com|web\.push|mozilla\.com|fcm\.googleapis|updates\.push\.services/i.test(token)) {
    return true;
  }
  if (/^https?:\/\//i.test(token) && (sub.web_auth || sub.web_p256dh || sub.web_p256)) return true;
  return !!(sub.web_auth || sub.web_p256dh || sub.web_p256);
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

async function postOneSignalNotification(payload) {
  const resp = await fetch(ONESIGNAL_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Key ' + process.env.ONESIGNAL_REST_API_KEY,
    },
    body: JSON.stringify(payload),
  });
  const json = parseJson(await resp.text());
  const recipients = typeof json?.recipients === 'number' ? json.recipients : null;
  const hasErrors = Array.isArray(json?.errors) && json.errors.length > 0;
  const invalidAliases =
    json?.invalid_aliases &&
    Array.isArray(json.invalid_aliases.external_id) &&
    json.invalid_aliases.external_id.length > 0;
  const invalidExternal =
    Array.isArray(json?.invalid_external_user_ids) && json.invalid_external_user_ids.length > 0;
  const usedPlayerIds = Array.isArray(payload.include_player_ids) && payload.include_player_ids.length > 0;
  const usedSubIds =
    Array.isArray(payload.include_subscription_ids) && payload.include_subscription_ids.length > 0;
  const delivered =
    resp.ok &&
    !hasErrors &&
    !invalidAliases &&
    !invalidExternal &&
    (recipients > 0 ||
      (recipients === null && json?.id && (usedPlayerIds || usedSubIds)));

  return {
    ok: delivered,
    status: resp.status,
    result: json,
    recipients: recipients == null ? (delivered && usedPlayerIds ? 1 : 0) : recipients,
    error: delivered ? null : json,
  };
}

/** Récupère les IDs d'abonnement (User Model + API legacy /players). */
async function getWebPushTargets(externalId) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  const out = { subscriptionIds: [], playerIds: [] };
  const eid = String(externalId || '').trim();
  if (!appId || !apiKey || !eid) return out;

  try {
    const userResp = await fetch(
      'https://api.onesignal.com/apps/' +
        encodeURIComponent(appId) +
        '/users/by/external_id/' +
        encodeURIComponent(eid),
      { headers: { Authorization: 'Key ' + apiKey, Accept: 'application/json' } }
    );
    if (userResp.ok) {
      const user = parseJson(await userResp.text());
      (user?.subscriptions || []).forEach((s) => {
        if (s?.id && isWebPushSub(s) && isSubscribed(s)) out.subscriptionIds.push(String(s.id));
      });
    }
  } catch (e) {
    console.warn('[onesignal] get user subscriptions', e);
  }

  for (const authorization of ['Key ' + apiKey, 'Basic ' + apiKey]) {
    try {
      const listUrl =
        'https://onesignal.com/api/v1/players?app_id=' +
        encodeURIComponent(appId) +
        '&external_user_id=' +
        encodeURIComponent(eid) +
        '&limit=50';
      const resp = await fetch(listUrl, { headers: { Authorization: authorization } });
      if (!resp.ok) continue;
      const json = parseJson(await resp.text());
      (json?.players || []).forEach((p) => {
        if (
          p?.id &&
          p.identifier &&
          p.invalid_identifier !== true &&
          p.invalid_identifier !== 't' &&
          (p.notification_types === 1 ||
            p.notification_types === '1' ||
            p.notification_types == null)
        ) {
          out.playerIds.push(String(p.id));
        }
      });
      if (out.playerIds.length) break;
    } catch (_) {}
  }

  if (!out.playerIds.length) {
    for (const authorization of ['Key ' + apiKey, 'Basic ' + apiKey]) {
      try {
        const scanUrl =
          'https://onesignal.com/api/v1/players?app_id=' +
          encodeURIComponent(appId) +
          '&limit=100';
        const resp = await fetch(scanUrl, { headers: { Authorization: authorization } });
        if (!resp.ok) continue;
        const json = parseJson(await resp.text());
        (json?.players || []).forEach((p) => {
          if (String(p?.external_user_id || '') === eid && p?.id) {
            out.playerIds.push(String(p.id));
          }
        });
        if (out.playerIds.length) break;
      } catch (_) {}
    }
  }

  out.subscriptionIds = [...new Set(out.subscriptionIds)];
  out.playerIds = [...new Set(out.playerIds)];
  return out;
}

function countDeliverableTargets(targets) {
  const t = targets || { subscriptionIds: [], playerIds: [] };
  return (t.subscriptionIds?.length || 0) + (t.playerIds?.length || 0);
}

/** OneSignal indexe parfois l'abonnement quelques secondes après l'API register. */
async function waitForWebPushTargets(externalId, attempts) {
  const max = Math.min(Math.max(attempts || 8, 1), 12);
  let last = { subscriptionIds: [], playerIds: [] };
  for (let i = 0; i < max; i++) {
    last = await getWebPushTargets(externalId);
    if (countDeliverableTargets(last) > 0) return last;
    if (i < max - 1) {
      await new Promise(function (r) {
        setTimeout(r, 600 + i * 500);
      });
    }
  }
  return last;
}

function notificationDelivered(result, targeting, targets) {
  if (!result || !result.ok) return false;
  const n = result.recipients;
  if (typeof n === 'number' && n > 0) return true;
  if (targeting.include_subscription_ids && targets.subscriptionIds.length && result.result?.id) {
    return true;
  }
  if (targeting.include_player_ids && targets.playerIds.length && result.result?.id) {
    return true;
  }
  return false;
}

async function sendToExternalUsers({
  externalUserIds,
  heading,
  body,
  url,
  data,
  playerIds,
  subscriptionIds,
  deviceOnly,
}) {
  if (!isConfigured()) return { ok: false, skipped: true, reason: 'not_configured' };
  const ids = [...new Set((externalUserIds || []).map((id) => String(id || '').trim()).filter(Boolean))];
  if (!ids.length) return { ok: false, skipped: true, reason: 'no_targets' };

  const base = {
    app_id: process.env.ONESIGNAL_APP_ID,
    target_channel: 'push',
    headings: { fr: heading, en: heading },
    contents: { fr: body, en: body },
    data: data || {},
    priority: 10,
  };
  if (url) base.url = url;
  if (data && data.collapseId) {
    base.collapse_id = String(data.collapseId).slice(0, 64);
    delete base.data.collapseId;
  }

  const providedPlayers = Array.isArray(playerIds)
    ? [...new Set(playerIds.map(String).filter(Boolean))]
    : [];
  const providedSubs = Array.isArray(subscriptionIds)
    ? [...new Set(subscriptionIds.map(String).filter(Boolean))]
    : [];

  let targets = { subscriptionIds: [], playerIds: [] };
  if (deviceOnly && (providedPlayers.length || providedSubs.length)) {
    targets = { subscriptionIds: providedSubs, playerIds: providedPlayers };
  } else {
    targets = await getWebPushTargets(ids[0]);
    if (providedPlayers.length) {
      targets.playerIds = [...new Set([...providedPlayers, ...targets.playerIds])].slice(0, 5);
    }
    if (providedSubs.length) {
      targets.subscriptionIds = [...new Set([...providedSubs, ...targets.subscriptionIds])];
    }
    targets.playerIds = targets.playerIds.slice(0, 5);
  }

  const attempts = [];
  if (targets.subscriptionIds.length) {
    attempts.push({ include_subscription_ids: targets.subscriptionIds });
  }
  attempts.push({ include_aliases: { external_id: ids } });
  attempts.push({ include_external_user_ids: ids });
  if (targets.playerIds.length) {
    attempts.push({ include_player_ids: targets.playerIds });
  }

  let last = null;
  for (const targeting of attempts) {
    const via = Object.keys(targeting)[0];
    const result = await postOneSignalNotification({ ...base, ...targeting });
    last = result;
    if (notificationDelivered(result, targeting, targets)) {
      console.log(
        '[onesignal] sent',
        ids.join(','),
        via,
        'subs=' + targets.subscriptionIds.length,
        'players=' + targets.playerIds.length,
        result.recipients,
        result.result?.id || ''
      );
      return {
        ok: true,
        result: result.result,
        recipients: result.recipients,
        via,
        targets,
        deviceCount: Math.max(targets.subscriptionIds.length, targets.playerIds.length),
      };
    }
  }

  console.warn('[onesignal] no delivery', ids.join(','), JSON.stringify(last?.error || last?.result));
  return {
    ok: false,
    status: last?.status,
    error: last?.error,
    recipients: last?.recipients ?? 0,
    targets,
    reason: 'no_subscribed_devices',
    hint:
      'Aucun appareil joignable. Menu ⚙️ → Finaliser l\'enregistrement, puis réessayez. Vérifiez aussi que les notifications Windows sont activées pour Chrome/Edge.',
  };
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

function pushOpenUrl(role, target) {
  const origin = siteOrigin();
  return (
    origin +
    '/open.html?role=' +
    encodeURIComponent(role) +
    '&target=' +
    encodeURIComponent(target || 'messages')
  );
}

async function notifyChatMessage({ sender, portalId, labUserId, senderName, content, laboName }) {
  const preview = trimPreview(content, 200) || 'Nouveau message';
  const from = trimPreview(senderName, 60) || (sender === 'labo' ? laboName || 'Votre laboratoire' : 'Un cabinet');
  const collapseId = 'chat_' + String(portalId || '').trim().toLowerCase();

  if (sender === 'labo') {
    const who = trimPreview(laboName, 40) || 'Votre laboratoire';
    return sendToExternalUsers({
      externalUserIds: [cabinetExternalId(portalId)],
      heading: who,
      body: preview,
      url: pushOpenUrl('cab', 'messages'),
      data: { kind: 'chat', portalId, sender: 'labo', collapseId },
    });
  }

  if (sender === 'cabinet' && labUserId) {
    return sendToExternalUsers({
      externalUserIds: [labExternalId(labUserId)],
      heading: from,
      body: preview,
      url: pushOpenUrl('lab', 'messages'),
      data: { kind: 'chat', portalId, sender: 'cabinet', collapseId },
    });
  }

  return { ok: false, skipped: true, reason: 'no_recipient' };
}

async function notifyInvoice({ portalId, facture, laboName, cabName }) {
  const num = facture.num || facture.id || '';
  const total =
    typeof facture.total === 'number'
      ? facture.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
      : '';
  const body = total
    ? 'Facture ' + num + ' — ' + total
    : 'Facture ' + num + ' disponible sur votre espace.';

  const who = trimPreview(laboName, 40) || 'Votre laboratoire';
  return sendToExternalUsers({
    externalUserIds: [cabinetExternalId(portalId)],
    heading: who,
    body,
    url: pushOpenUrl('cab', 'factures'),
    data: {
      kind: 'invoice',
      portalId,
      factureId: facture.id || null,
      collapseId: 'invoice_' + String(portalId || '').trim().toLowerCase(),
    },
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
  if (pushType === 'WebPush' || pushType === 'web_push') return 5;
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
        return { ok: true, result: { id: playerId }, method: 'legacy_players_update' };
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
    const targets = await waitForWebPushTargets(eid, 8);
    const n = countDeliverableTargets(targets);
    if (n > 0) {
      return {
        ok: true,
        result: json,
        deliverable: n,
        playerId: targets.playerIds[0] || null,
        subscriptionId: targets.subscriptionIds[0] || null,
        targets,
      };
    }
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
      const targets = await waitForWebPushTargets(eid, 8);
      const n = countDeliverableTargets(targets);
      if (n > 0) {
        return {
          ok: true,
          result: json,
          deliverable: n,
          playerId: targets.playerIds[0] || null,
          subscriptionId: targets.subscriptionIds[0] || null,
          targets,
        };
      }
    }
  }

  const typesToTry = [...new Set([type, 'ChromePush', 'WebPush', 'SafariPush'])];
  for (const tryType of typesToTry) {
    if (tryType === type) continue;
    const retry = await registerLegacyWebPlayer({
      externalId: eid,
      endpoint: token,
      auth,
      p256dh,
      pushType: tryType,
    });
    if (retry.ok) {
      const targets = await waitForWebPushTargets(eid, 6);
      const n = countDeliverableTargets(targets);
      if (n > 0) {
        return {
          ...retry,
          deliverable: n,
          playerId: retry.result?.id || targets.playerIds[0] || null,
          subscriptionId: targets.subscriptionIds[0] || null,
          targets,
        };
      }
    }
  }

  let legacy = await registerLegacyWebPlayer({
    externalId: eid,
    endpoint: token,
    auth,
    p256dh,
    pushType: type,
  });
  if (!legacy.ok && type === 'WebPush') {
    legacy = await registerLegacyWebPlayer({
      externalId: eid,
      endpoint: token,
      auth,
      p256dh,
      pushType: 'ChromePush',
    });
  }
  if (legacy.ok) {
    const targets = await waitForWebPushTargets(eid, 8);
    const n = countDeliverableTargets(targets);
    if (n > 0) {
      return {
        ...legacy,
        deliverable: n,
        playerId: legacy.result?.id || targets.playerIds[0] || null,
        subscriptionId: targets.subscriptionIds[0] || null,
        targets,
      };
    }
  }

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
  getWebPushTargets,
  waitForWebPushTargets,
  countDeliverableTargets,
  upsertWebPushSubscription,
  hasLegacyWebPlayer,
  formatOnesignalApiError,
  cabinetExternalId,
  labExternalId,
  detectNewlySentInvoices,
  notifyChatMessage,
  notifyInvoice,
};
