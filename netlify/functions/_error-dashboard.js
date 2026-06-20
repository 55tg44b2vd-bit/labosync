const SB_URL = 'https://ljnfpslgwgagdisixuxz.supabase.co';

function clamp(value, maxLen) {
  return String(value || '').slice(0, maxLen);
}

function normalizeClientError(body, now) {
  return {
    level: clamp(body.level || 'error', 20),
    app: clamp(body.app || 'unknown', 40),
    message: clamp(body.message || '', 5000),
    stack: clamp(body.stack || '', 12000),
    page: clamp(body.page || '', 500),
    userId: clamp(body.userId || '', 120),
    traceId: clamp(body.traceId || '', 120),
    createdAt: (now || new Date()).toISOString(),
  };
}

async function saveClientError(serviceKey, payload, fetchImpl) {
  const doFetch = fetchImpl || fetch;
  if (!serviceKey) return;
  await doFetch(`${SB_URL}/rest/v1/labo_data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      data: payload,
      updated_at: new Date().toISOString(),
    }),
  });
}

function errorTimestamp(row) {
  const data = row && row.data ? row.data : {};
  return Date.parse(data.createdAt || row.updated_at || '') || 0;
}

function groupCount(rows, keyFn, limit) {
  const counts = new Map();
  rows.forEach((row) => {
    const key = keyFn(row);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit || 8);
}

function buildErrorDashboard(rows, opts) {
  const nowMs = opts && opts.nowMs ? opts.nowMs : Date.now();
  const threshold = opts && opts.threshold ? opts.threshold : 20;
  const cleanRows = (rows || [])
    .filter((row) => row && row.data)
    .map((row) => ({
      id: row.id,
      updated_at: row.updated_at,
      data: row.data || {},
      ts: errorTimestamp(row),
    }))
    .filter((row) => row.ts > 0)
    .sort((a, b) => b.ts - a.ts);

  const lastHourRows = cleanRows.filter((row) => nowMs - row.ts <= 60 * 60 * 1000);
  const last24hRows = cleanRows.filter((row) => nowMs - row.ts <= 24 * 60 * 60 * 1000);

  return {
    summary: {
      total24h: last24hRows.length,
      lastHour: lastHourRows.length,
      threshold,
      status: lastHourRows.length >= threshold ? 'alert' : 'ok',
      apps: groupCount(last24hRows, (row) => clamp(row.data.app || 'unknown', 40), 6),
      pages: groupCount(last24hRows, (row) => clamp(row.data.page || '(sans page)', 120), 8),
      messages: groupCount(last24hRows, (row) => clamp(row.data.message || '(sans message)', 160), 8),
    },
    recent: cleanRows.slice(0, 30).map((row) => ({
      id: row.id,
      at: row.data.createdAt || row.updated_at,
      level: row.data.level || 'error',
      app: row.data.app || 'unknown',
      page: row.data.page || '',
      userId: row.data.userId || '',
      traceId: row.data.traceId || '',
      message: row.data.message || '',
    })),
  };
}

async function readErrorDashboard(serviceKey, opts) {
  const limit = Math.min(1000, Math.max(50, parseInt((opts && opts.limit) || 500, 10) || 500));
  const threshold = Math.max(1, parseInt((opts && opts.threshold) || 20, 10) || 20);
  const r = await fetch(
    `${SB_URL}/rest/v1/labo_data?id=like.err_%25&select=id,data,updated_at&order=updated_at.desc&limit=${limit}`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  if (!r.ok) throw new Error(`Lecture erreurs impossible (${r.status})`);
  const rows = await r.json();
  return buildErrorDashboard(rows, { threshold });
}

async function readAlertState(serviceKey) {
  const r = await fetch(`${SB_URL}/rest/v1/labo_data?id=eq.platform_err_alert&select=data`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0] && rows[0].data ? rows[0].data : null;
}

async function writeAlertState(serviceKey, data) {
  await fetch(`${SB_URL}/rest/v1/labo_data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: 'platform_err_alert',
      data: Object.assign({}, data, { updatedAt: new Date().toISOString() }),
      updated_at: new Date().toISOString(),
    }),
  });
}

async function postErrorWebhook(webhookUrl, payload) {
  if (!webhookUrl) return false;
  try {
    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return r.ok;
  } catch (_) {
    return false;
  }
}

async function sendErrorAlertEmail({ to, subject, html, resendKey, fromEmail }) {
  if (!resendKey || !to) return false;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail || 'alerts@labosync.app',
      to: [to],
      subject,
      html,
    }),
  });
  return r.ok;
}

/**
 * Déclenche une alerte si le seuil horaire est dépassé (cooldown 1h entre alertes).
 */
async function maybeFireErrorAlert(serviceKey, opts) {
  if (!serviceKey) return { fired: false, reason: 'no_service_key' };

  const threshold = Math.max(1, parseInt(process.env.ERROR_ALERT_THRESHOLD || '20', 10) || 20);
  const cooldownMs = Math.max(15, parseInt(process.env.ERROR_ALERT_COOLDOWN_MIN || '60', 10) || 60) * 60 * 1000;
  const webhookUrl = (process.env.ERROR_ALERT_WEBHOOK_URL || '').trim();
  const alertEmail = (process.env.ERROR_ALERT_EMAIL || process.env.ADMIN_EMAILS || '').split(',')[0].trim();
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL || 'alerts@labosync.app').trim();

  const dashboard = await readErrorDashboard(serviceKey, { threshold, limit: 400 });
  if (dashboard.summary.status !== 'alert') {
    return { fired: false, reason: 'below_threshold', lastHour: dashboard.summary.lastHour };
  }

  const state = (await readAlertState(serviceKey)) || {};
  const lastFired = Date.parse(state.lastFiredAt || '') || 0;
  if (lastFired && Date.now() - lastFired < cooldownMs) {
    return { fired: false, reason: 'cooldown', lastHour: dashboard.summary.lastHour };
  }

  const topMsg = (dashboard.summary.messages[0] && dashboard.summary.messages[0].key) || '—';
  const topApp = (dashboard.summary.apps[0] && dashboard.summary.apps[0].key) || '—';
  const text =
    `Alerte Labosync : ${dashboard.summary.lastHour} erreurs/heure (seuil ${threshold}).\n` +
    `App la plus touchée : ${topApp}\nMessage fréquent : ${topMsg.slice(0, 120)}`;

  const payload = {
    text,
    summary: dashboard.summary,
    recent: dashboard.recent.slice(0, 5),
    at: new Date().toISOString(),
  };

  let channel = 'none';
  if (webhookUrl) {
    const ok = await postErrorWebhook(webhookUrl, payload);
    if (ok) channel = 'webhook';
  }
  if (channel === 'none' && alertEmail && resendKey) {
    const html =
      '<p><strong>Alerte erreurs Labosync</strong></p>' +
      '<p>' +
      dashboard.summary.lastHour +
      ' erreurs sur la dernière heure (seuil ' +
      threshold +
      ').</p>' +
      '<p>Application : ' +
      topApp +
      '<br/>Message : ' +
      topMsg.slice(0, 200) +
      '</p>' +
      '<p>Consultez la console admin → Observabilité.</p>';
    const ok = await sendErrorAlertEmail({
      to: alertEmail,
      subject: `[Labosync] Alerte erreurs (${dashboard.summary.lastHour}/h)`,
      html,
      resendKey,
      fromEmail,
    });
    if (ok) channel = 'email';
  }

  await writeAlertState(serviceKey, {
    lastFiredAt: new Date().toISOString(),
    lastHour: dashboard.summary.lastHour,
    threshold,
    channel,
  });

  return { fired: channel !== 'none', channel, lastHour: dashboard.summary.lastHour };
}

module.exports = {
  normalizeClientError,
  saveClientError,
  buildErrorDashboard,
  readErrorDashboard,
  maybeFireErrorAlert,
};
