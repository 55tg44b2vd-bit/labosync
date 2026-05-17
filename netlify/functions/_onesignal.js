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
    console.warn('[onesignal] send failed', resp.status, json);
    return { ok: false, status: resp.status, error: json };
  }
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

module.exports = {
  isConfigured,
  sendToExternalUsers,
  cabinetExternalId,
  labExternalId,
  detectNewlySentInvoices,
  notifyChatMessage,
  notifyInvoice,
};
