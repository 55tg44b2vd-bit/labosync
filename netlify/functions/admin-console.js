const { readErrorDashboard } = require('./_error-dashboard');

exports.handler = async (event) => {
  const SB_URL = 'https://ljnfpslgwgagdisixuxz.supabase.co';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const STRIPE_SECRET_KEY = process.env.STRIPE_SUBSCRIPTION_KEY || process.env.STRIPE_SECRET_KEY || '';
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const ADMIN_CONSOLE_SECRET = (process.env.ADMIN_CONSOLE_SECRET || '').trim();
  const ADMIN_REQUIRE_MFA_RAW = (process.env.ADMIN_REQUIRE_MFA || '').trim().toLowerCase();
  const ADMIN_REQUIRE_MFA = ADMIN_REQUIRE_MFA_RAW === '1' || ADMIN_REQUIRE_MFA_RAW === 'true' || ADMIN_REQUIRE_MFA_RAW === 'yes';

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const reqOrigin = event.headers.origin || event.headers.Origin || '';
  const allowOrigin = allowedOrigins.length
    ? (allowedOrigins.includes(reqOrigin) ? reqOrigin : allowedOrigins[0])
    : '*';
  const corsHeaders = 'Content-Type, Authorization, X-Admin-Secret';
  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': corsHeaders,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  const json = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Méthode non autorisée' });
  if (!SERVICE_KEY) return json(503, { error: 'Configuration serveur incomplète (SUPABASE_SERVICE_KEY)' });

  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!accessToken) return json(401, { error: 'Session invalide (token absent)' });

  const hdrLower = {};
  Object.keys(event.headers || {}).forEach((k) => { hdrLower[String(k).toLowerCase()] = event.headers[k]; });
  const adminSecretHeader = hdrLower['x-admin-secret'] || '';

  const ip = (event.headers['x-forwarded-for'] || event.headers['client-ip'] || '').split(',')[0].trim() || 'unknown';
  if (!global.__ADMIN_CONSOLE_RL__) global.__ADMIN_CONSOLE_RL__ = new Map();
  const nowMs = Date.now();
  const entry = global.__ADMIN_CONSOLE_RL__.get(ip) || { count: 0, resetAt: nowMs + 60_000 };
  if (nowMs > entry.resetAt) { entry.count = 0; entry.resetAt = nowMs + 60_000; }
  entry.count += 1;
  global.__ADMIN_CONSOLE_RL__.set(ip, entry);
  if (entry.count > 120) return json(429, { error: 'Trop de requêtes admin, réessayez dans 1 minute' });

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'JSON invalide' }); }
  const action = String(body.action || '');

  async function getCurrentUser() {
    const r = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!r.ok) return null;
    return r.json();
  }

  const me = await getCurrentUser();
  if (!me || !me.id || !me.email) return json(401, { error: 'Session expirée' });
  const myEmail = String(me.email || '').toLowerCase();
  if (!me.email_confirmed_at) return json(403, { error: 'Email non confirmé pour le compte admin' });
  if (!ADMIN_EMAILS.length) return json(403, { error: 'ADMIN_EMAILS non configuré sur Netlify' });
  if (!ADMIN_EMAILS.includes(myEmail)) return json(403, { error: 'Accès administrateur refusé' });

  if (ADMIN_CONSOLE_SECRET) {
    const provided = String(body.adminSecret || adminSecretHeader || '').trim();
    if (provided !== ADMIN_CONSOLE_SECRET) {
      return json(403, {
        error: 'Secret administrateur requis ou invalide (variable Netlify ADMIN_CONSOLE_SECRET)',
        code: 'ADMIN_SECRET_REQUIRED',
      });
    }
  }

  if (ADMIN_REQUIRE_MFA) {
    const mfaOk = await checkMfaEnrolled(me.id);
    if (!mfaOk) {
      return json(403, {
        error: 'MFA requis : activez l’authentification à deux facteurs sur votre compte admin (Supabase → Authentication → Multi-Factor).',
      });
    }
  }

  async function checkMfaEnrolled(userId) {
    try {
      const r = await fetch(`${SB_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
      });
      if (!r.ok) return true;
      const payload = await r.json();
      const user = payload.user || payload;
      const factors = user.factors || user.mfa_factors || [];
      return factors.some((f) => f && f.status === 'verified' && (f.factor_type === 'totp' || f.factor_type === 'phone'));
    } catch (_) {
      return true;
    }
  }

  async function writeAdminAudit(actionName, payload) {
    try {
      await fetch(`${SB_URL}/rest/v1/labo_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          id: `admin_audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          data: {
            action: String(actionName || 'unknown').slice(0, 80),
            actorUserId: me.id,
            actorEmail: myEmail,
            ip: ip.slice(0, 120),
            payload: payload || {},
            createdAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        }),
      });
    } catch (_) {}
  }

  async function readSubRows() {
    const r = await fetch(`${SB_URL}/rest/v1/labo_data?id=like.sub_*&select=id,data,updated_at&order=updated_at.desc`, {
      headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
    });
    if (!r.ok) throw new Error(`Lecture abonnements impossible (${r.status})`);
    return r.json();
  }

  async function readAuthUsers() {
    const r = await fetch(`${SB_URL}/auth/v1/admin/users?page=1&per_page=1000`, {
      headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
    });
    if (!r.ok) throw new Error(`Lecture utilisateurs impossible (${r.status})`);
    const payload = await r.json();
    return Array.isArray(payload.users) ? payload.users : [];
  }

  async function readSubByUserId(userId) {
    const r = await fetch(`${SB_URL}/rest/v1/labo_data?id=eq.sub_${encodeURIComponent(userId)}&select=data`, {
      headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
    });
    const rows = await r.json().catch(() => []);
    return rows[0] && rows[0].data ? rows[0].data : null;
  }

  async function upsertSub(userId, data) {
    const now = new Date().toISOString();
    const r = await fetch(`${SB_URL}/rest/v1/labo_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ id: `sub_${userId}`, data, updated_at: now }),
    });
    if (!r.ok) throw new Error(`Sauvegarde abonnement impossible (${r.status})`);
  }

  async function getAuthUserDetail(userId) {
    try {
      const r = await fetch(`${SB_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
      });
      if (!r.ok) return null;
      const payload = await r.json();
      const u = payload.user || payload;
      return {
        id: u.id,
        email: u.email || '',
        created_at: u.created_at || null,
        last_sign_in_at: u.last_sign_in_at || null,
        email_confirmed_at: u.email_confirmed_at || null,
        banned_until: u.banned_until || null,
      };
    } catch (_) {
      return null;
    }
  }

  async function stripeCancelAtPeriodEnd(subId) {
    if (!STRIPE_SECRET_KEY || !subId) return { ok: false, note: 'Stripe non configuré' };
    const params = new URLSearchParams({ cancel_at_period_end: 'true' });
    const r = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subId)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error && err.error.message ? err.error.message : `Stripe ${r.status}`);
    }
    return { ok: true };
  }

  async function stripeCancelNow(subId) {
    if (!STRIPE_SECRET_KEY || !subId) throw new Error('Stripe non configuré');
    const r = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subId)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error && err.error.message ? err.error.message : `Stripe ${r.status}`);
    }
    return r.json().catch(() => ({}));
  }

  async function stripeFetchSubscription(subId) {
    if (!STRIPE_SECRET_KEY || !subId) return null;
    const r = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subId)}`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
    });
    if (!r.ok) return null;
    return r.json();
  }

  function subscriptionPatchFromStripe(sub, stripeSub) {
    if (!stripeSub) return {};
    const price = stripeSub.items && stripeSub.items.data && stripeSub.items.data[0] ? stripeSub.items.data[0].price : null;
    const interval = price && price.recurring ? price.recurring.interval : '';
    return {
      status: stripeSub.status || undefined,
      currentPeriodEnd: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000).toISOString() : null,
      trialEndsAt: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000).toISOString() : null,
      cancelAt: stripeSub.cancel_at ? new Date(stripeSub.cancel_at * 1000).toISOString() : null,
      cancelAtPeriodEnd: !!stripeSub.cancel_at_period_end,
      priceId: price ? price.id : '',
      plan: interval === 'year' ? 'annual' : (interval === 'month' ? 'monthly' : undefined),
      updatedAt: new Date().toISOString(),
    };
  }

  const MS_DAY = 86400000;

  function computeItemAlerts(row) {
    const alerts = [];
    const sub = row.subscription || {};
    const now = Date.now();
    if (sub.blocked) alerts.push('blocked');
    if (sub.status === 'past_due' || sub.status === 'unpaid') alerts.push('past_due');
    if (sub.status === 'checkout_pending') alerts.push('checkout');
    const trialEnd = Date.parse(sub.trialEndsAt || sub.trialEnd || '') || 0;
    if (trialEnd && trialEnd > now && trialEnd - now <= 7 * MS_DAY) alerts.push('trial_expiring');
    if (trialEnd && trialEnd < now && (sub.status === 'trialing' || !sub.status)) alerts.push('trial_expired');
    const granted = Date.parse(sub.grantedAccessUntil || '') || 0;
    if (granted && granted < now && sub.status !== 'active' && !sub.blocked) alerts.push('access_expired');
    const lastIn = Date.parse(row.lastSignInAt || '') || 0;
    if (!lastIn || now - lastIn > 30 * MS_DAY) alerts.push('inactive');
    if (!row.emailConfirmed && row.email) alerts.push('email_unconfirmed');
    return alerts;
  }

  function mergeOverview(subRows, users) {
    const byUserId = new Map();
    users.forEach((u) => {
      byUserId.set(u.id, {
        userId: u.id,
        email: u.email || '',
        emailConfirmed: !!u.email_confirmed_at,
        createdAt: u.created_at || null,
        lastSignInAt: u.last_sign_in_at || null,
        subscription: null,
        adminTags: [],
      });
    });
    subRows.forEach((row) => {
      const sub = row && row.data ? row.data : {};
      const userId = String(sub.userId || sub.labUserId || String(row.id || '').replace(/^sub_/, ''));
      const existing = byUserId.get(userId) || {
        userId,
        email: sub.email || '',
        emailConfirmed: false,
        createdAt: null,
        lastSignInAt: null,
        subscription: null,
        adminTags: [],
      };
      existing.email = existing.email || sub.email || '';
      existing.subscription = Object.assign({}, sub, { _updatedAt: row.updated_at || sub.updatedAt || null });
      existing.adminTags = Array.isArray(sub.adminTags) ? sub.adminTags : [];
      byUserId.set(userId, existing);
    });
    const items = Array.from(byUserId.values()).map((row) => {
      const alerts = computeItemAlerts(row);
      return Object.assign({}, row, { alerts, needsAttention: alerts.length > 0 });
    }).sort((a, b) => {
      if (a.needsAttention !== b.needsAttention) return a.needsAttention ? -1 : 1;
      const ad = Date.parse((a.subscription && (a.subscription.updatedAt || a.subscription._updatedAt)) || a.lastSignInAt || a.createdAt || 0) || 0;
      const bd = Date.parse((b.subscription && (b.subscription.updatedAt || b.subscription._updatedAt)) || b.lastSignInAt || b.createdAt || 0) || 0;
      return bd - ad;
    });
    const summary = {
      usersTotal: items.length,
      activeSubs: items.filter((x) => x.subscription && x.subscription.status === 'active').length,
      trialingSubs: items.filter((x) => x.subscription && x.subscription.status === 'trialing').length,
      blockedUsers: items.filter((x) => x.subscription && x.subscription.blocked).length,
      pastDueSubs: items.filter((x) => x.subscription && (x.subscription.status === 'past_due' || x.subscription.status === 'unpaid')).length,
      needsAttention: items.filter((x) => x.needsAttention).length,
      trialExpiring: items.filter((x) => (x.alerts || []).includes('trial_expiring')).length,
      inactiveUsers: items.filter((x) => (x.alerts || []).includes('inactive')).length,
    };
    return { summary, items };
  }

  async function readLabStats(userId) {
    const stats = {
      hasCloudData: false,
      lastSync: null,
      labName: '',
      jobs: 0,
      cabinets: 0,
      queue: 0,
      portals: 0,
      recentErrors: [],
    };
    try {
      const mainR = await fetch(`${SB_URL}/rest/v1/labo_data?id=eq.${encodeURIComponent(userId)}&select=data,updated_at`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      });
      const rows = await mainR.json().catch(() => []);
      if (rows[0]) {
        stats.hasCloudData = true;
        stats.lastSync = rows[0].updated_at || null;
        const d = rows[0].data || {};
        stats.labName = String(d.labName || d.name || '').slice(0, 120);
        stats.jobs = Array.isArray(d.jobs) ? d.jobs.length : 0;
        stats.cabinets = Array.isArray(d.cabinets) ? d.cabinets.length : 0;
        stats.queue = Array.isArray(d.queue) ? d.queue.length : 0;
      }
    } catch (_) {}
    try {
      const pr = await fetch(
        `${SB_URL}/rest/v1/labo_data?data->>labUserId=eq.${encodeURIComponent(userId)}&id=like.portal_*&select=id&limit=300`,
        { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
      );
      const portals = await pr.json().catch(() => []);
      stats.portals = Array.isArray(portals) ? portals.length : 0;
    } catch (_) {}
    try {
      const er = await fetch(
        `${SB_URL}/rest/v1/labo_data?id=like.err_*&data->>userId=eq.${encodeURIComponent(userId)}&select=id,data,updated_at&order=updated_at.desc&limit=8`,
        { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
      );
      const errRows = await er.json().catch(() => []);
      stats.recentErrors = (errRows || []).map((row) => ({
        at: row.updated_at || (row.data && row.data.createdAt),
        level: row.data && row.data.level,
        message: row.data && row.data.message,
        page: row.data && row.data.page,
      }));
    } catch (_) {}
    return stats;
  }

  async function readStripeConnect(userId) {
    const empty = { connected: false, stripeAccountId: null, connectedAt: null, livemode: null };
    try {
      const r = await fetch(
        `${SB_URL}/rest/v1/labo_data?id=eq.${encodeURIComponent('stripe_connect_' + userId)}&select=data,updated_at`,
        { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
      );
      const rows = await r.json().catch(() => []);
      const data = rows[0] && rows[0].data ? rows[0].data : null;
      if (!data || !data.stripeAccountId) return empty;
      return {
        connected: true,
        stripeAccountId: String(data.stripeAccountId),
        connectedAt: data.connectedAt || rows[0].updated_at || null,
        livemode: data.livemode != null ? !!data.livemode : null,
      };
    } catch (_) {
      return empty;
    }
  }

  function stripeDashboardUrls(sub, connect) {
    const out = {};
    if (sub && sub.stripeCustomerId) {
      out.customer = `https://dashboard.stripe.com/customers/${encodeURIComponent(sub.stripeCustomerId)}`;
    }
    if (sub && sub.stripeSubscriptionId) {
      out.subscription = `https://dashboard.stripe.com/subscriptions/${encodeURIComponent(sub.stripeSubscriptionId)}`;
    }
    if (connect && connect.stripeAccountId) {
      out.connectAccount = `https://dashboard.stripe.com/connect/accounts/${encodeURIComponent(connect.stripeAccountId)}`;
    }
    return out;
  }

  async function generateAuthLink(email, type) {
    const r = await fetch(`${SB_URL}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: type || 'recovery',
        email: String(email || '').trim(),
      }),
    });
    const payload = await r.json().catch(() => ({}));
    if (!r.ok) {
      throw new Error(payload.msg || payload.error_description || payload.message || `Auth link ${r.status}`);
    }
    return payload.action_link || payload.redirect_to || '';
  }

  if (action === 'verify') {
    return json(200, {
      ok: true,
      isAdmin: true,
      role: 'admin',
      email: me.email,
      requiresSecret: !!ADMIN_CONSOLE_SECRET,
      mfaRequired: ADMIN_REQUIRE_MFA,
    });
  }

  if (action === 'overview') {
    const [subRows, users] = await Promise.all([readSubRows(), readAuthUsers()]);
    const data = mergeOverview(subRows, users);
    return json(200, { ok: true, data });
  }

  if (action === 'error_dashboard') {
    const threshold = process.env.ERROR_ALERT_THRESHOLD || body.threshold || 20;
    const data = await readErrorDashboard(SERVICE_KEY, { threshold, limit: body.limit || 500 });
    return json(200, { ok: true, data });
  }

  if (action === 'list_audits') {
    const limit = Math.min(100, Math.max(1, parseInt(body.limit, 10) || 50));
    const offset = Math.max(0, parseInt(body.offset, 10) || 0);
    const likeVal = encodeURIComponent('admin_audit_%');
    const r = await fetch(
      `${SB_URL}/rest/v1/labo_data?id=like.${likeVal}&select=id,data,updated_at&order=updated_at.desc&limit=${limit}&offset=${offset}`,
      { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } },
    );
    if (!r.ok) return json(500, { error: 'Lecture journal impossible' });
    const rows = await r.json();
    const items = (rows || []).map((row) => ({
      id: row.id,
      at: (row.data && row.data.createdAt) || row.updated_at,
      action: row.data && row.data.action,
      actorEmail: row.data && row.data.actorEmail,
      payload: row.data && row.data.payload,
    }));
    return json(200, { ok: true, items });
  }

  const userId = String(body.userId || '').trim();

  if (action === 'user_detail') {
    if (!userId) return json(400, { error: 'userId manquant' });
    const [sub, authDetail, labStats, stripeConnect] = await Promise.all([
      readSubByUserId(userId),
      getAuthUserDetail(userId),
      readLabStats(userId),
      readStripeConnect(userId),
    ]);
    let subData = sub || { userId, email: '', status: 'trialing' };
    const user = authDetail || {
      id: userId,
      email: subData.email || '',
      created_at: null,
      last_sign_in_at: null,
      email_confirmed_at: null,
    };
    const adminNotes = Array.isArray(subData.adminNotes) ? subData.adminNotes : [];
    const adminTags = Array.isArray(subData.adminTags) ? subData.adminTags : [];
    const overviewRow = {
      userId,
      email: user.email || subData.email,
      emailConfirmed: !!user.email_confirmed_at,
      lastSignInAt: user.last_sign_in_at,
      subscription: subData,
    };
    const alerts = computeItemAlerts(overviewRow);
    const hasStripeSubscription = !!(subData.stripeCustomerId || subData.stripeSubscriptionId);
    const health = {
      emailConfirmed: !!user.email_confirmed_at,
      hasCloudData: labStats.hasCloudData,
      hasActiveAccess: (() => {
        if (subData.blocked) return false;
        if (subData.status === 'active' || subData.status === 'trialing') return true;
        const g = Date.parse(subData.grantedAccessUntil || '') || 0;
        if (g > Date.now()) return true;
        const t = Date.parse(subData.trialEndsAt || subData.trialEnd || '') || 0;
        return t > Date.now();
      })(),
      stripeConnectLinked: !!(stripeConnect && stripeConnect.connected),
      stripeSubscriptionLinked: hasStripeSubscription,
      stripeSubscriptionExpected: subData.status === 'trialing' && !hasStripeSubscription,
      stripeLinked: hasStripeSubscription || !!(stripeConnect && stripeConnect.connected),
    };
    return json(200, {
      ok: true,
      user,
      subscription: subData,
      stripeConnect,
      adminNotes,
      adminTags,
      labStats,
      alerts,
      health,
      stripeUrls: stripeDashboardUrls(subData, stripeConnect),
    });
  }

  if (action === 'append_note') {
    if (!userId) return json(400, { error: 'userId manquant' });
    const text = String(body.note || '').trim().slice(0, 4000);
    if (!text) return json(400, { error: 'Note vide' });
    const existing = (await readSubByUserId(userId)) || { userId, email: body.email || '', status: 'trialing', createdAt: new Date().toISOString() };
    const notes = Array.isArray(existing.adminNotes) ? existing.adminNotes.slice(0, 199) : [];
    notes.unshift({ text, at: new Date().toISOString(), by: myEmail });
    const nextData = Object.assign({}, existing, { adminNotes: notes, updatedAt: new Date().toISOString() });
    await upsertSub(userId, nextData);
    await writeAdminAudit('append_note', { userId, preview: text.slice(0, 120) });
    return json(200, { ok: true, adminNotes: notes });
  }

  if (action === 'sync_stripe') {
    if (!userId) return json(400, { error: 'userId manquant' });
    const existing = (await readSubByUserId(userId)) || { userId, email: '', status: 'trialing' };
    if (!existing.stripeSubscriptionId) return json(400, { error: 'Aucun identifiant d’abonnement Stripe enregistré' });
    const stripeSub = await stripeFetchSubscription(existing.stripeSubscriptionId);
    if (!stripeSub) return json(502, { error: 'Impossible de lire l’abonnement Stripe' });
    const patch = subscriptionPatchFromStripe(existing, stripeSub);
    const nextData = Object.assign({}, existing, patch, {
      stripeSyncedAt: new Date().toISOString(),
      stripeSyncedBy: myEmail,
    });
    await upsertSub(userId, nextData);
    await writeAdminAudit('sync_stripe', { userId, stripeSubscriptionId: existing.stripeSubscriptionId, status: stripeSub.status });
    return json(200, { ok: true, subscription: nextData, stripe: { status: stripeSub.status, id: stripeSub.id } });
  }

  if (!userId) return json(400, { error: 'userId manquant' });

  const existing = (await readSubByUserId(userId)) || {
    userId,
    email: body.email || '',
    status: 'trialing',
    createdAt: new Date().toISOString(),
  };

  if (action === 'grant_days') {
    const days = Math.min(730, Math.max(1, parseInt(body.days, 10) || 0));
    if (!days) return json(400, { error: 'Nombre de jours invalide' });
    const now = Date.now();
    const current = Date.parse(existing.grantedAccessUntil || '') || 0;
    const base = Math.max(now, current);
    const next = new Date(base + days * 86400000).toISOString();
    const nextData = Object.assign({}, existing, {
      grantedAccessUntil: next,
      giftedBy: me.email,
      giftedAt: new Date().toISOString(),
      giftDaysAdded: days,
      updatedAt: new Date().toISOString(),
    });
    await upsertSub(userId, nextData);
    await writeAdminAudit('grant_days', { userId, days, grantedAccessUntil: next });
    return json(200, { ok: true, grantedAccessUntil: next });
  }

  if (action === 'grant_month') {
    const days = 30;
    const now = Date.now();
    const current = Date.parse(existing.grantedAccessUntil || '') || 0;
    const base = Math.max(now, current);
    const next = new Date(base + days * 86400000).toISOString();
    const nextData = Object.assign({}, existing, {
      grantedAccessUntil: next,
      giftedBy: me.email,
      giftedAt: new Date().toISOString(),
      giftDaysAdded: days,
      updatedAt: new Date().toISOString(),
    });
    await upsertSub(userId, nextData);
    await writeAdminAudit('grant_month', { userId, grantedAccessUntil: next });
    return json(200, { ok: true, grantedAccessUntil: next });
  }

  if (action === 'cancel_subscription') {
    if (!existing.stripeSubscriptionId) {
      return json(400, { error: 'Aucun abonnement Stripe actif pour cet utilisateur' });
    }
    await stripeCancelAtPeriodEnd(existing.stripeSubscriptionId);
    const nextData = Object.assign({}, existing, {
      cancelAtPeriodEnd: true,
      cancelRequestedBy: me.email,
      cancelRequestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await upsertSub(userId, nextData);
    await writeAdminAudit('cancel_subscription', { userId, stripeSubscriptionId: existing.stripeSubscriptionId });
    return json(200, { ok: true });
  }

  if (action === 'cancel_subscription_now') {
    if (!existing.stripeSubscriptionId) {
      return json(400, { error: 'Aucun abonnement Stripe pour cet utilisateur' });
    }
    await stripeCancelNow(existing.stripeSubscriptionId);
    const nextData = Object.assign({}, existing, {
      status: 'canceled',
      cancelAtPeriodEnd: false,
      canceledImmediatelyBy: me.email,
      canceledImmediatelyAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await upsertSub(userId, nextData);
    await writeAdminAudit('cancel_subscription_now', { userId, stripeSubscriptionId: existing.stripeSubscriptionId });
    return json(200, { ok: true });
  }

  if (action === 'set_blocked') {
    const blocked = !!body.blocked;
    const reason = String(body.reason || '').trim();
    const nextData = Object.assign({}, existing, {
      blocked,
      blockedReason: blocked ? reason : '',
      blockedAt: blocked ? new Date().toISOString() : null,
      blockedBy: blocked ? me.email : null,
      updatedAt: new Date().toISOString(),
    });
    if (blocked && existing.stripeSubscriptionId) {
      try { await stripeCancelAtPeriodEnd(existing.stripeSubscriptionId); } catch (_) {}
      nextData.cancelAtPeriodEnd = true;
    }
    await upsertSub(userId, nextData);
    await writeAdminAudit('set_blocked', { userId, blocked, reason: blocked ? reason.slice(0, 500) : '' });
    return json(200, { ok: true, blocked });
  }

  if (action === 'set_trial_until') {
    const until = String(body.trialEndsAt || body.until || '').trim();
    const parsed = Date.parse(until);
    if (!parsed || Number.isNaN(parsed)) return json(400, { error: 'Date de fin d’essai invalide' });
    const iso = new Date(parsed).toISOString();
    const nextData = Object.assign({}, existing, {
      trialEndsAt: iso,
      trialEnd: iso,
      status: 'trialing',
      trialExtendedBy: me.email,
      trialExtendedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await upsertSub(userId, nextData);
    await writeAdminAudit('set_trial_until', { userId, trialEndsAt: iso });
    return json(200, { ok: true, trialEndsAt: iso });
  }

  if (action === 'set_tags') {
    const raw = body.tags;
    const tags = Array.isArray(raw)
      ? raw.map((t) => String(t || '').trim().slice(0, 40)).filter(Boolean).slice(0, 12)
      : String(raw || '').split(',').map((t) => t.trim().slice(0, 40)).filter(Boolean).slice(0, 12);
    const nextData = Object.assign({}, existing, {
      adminTags: tags,
      adminTagsUpdatedAt: new Date().toISOString(),
      adminTagsUpdatedBy: me.email,
      updatedAt: new Date().toISOString(),
    });
    await upsertSub(userId, nextData);
    await writeAdminAudit('set_tags', { userId, tags });
    return json(200, { ok: true, adminTags: tags });
  }

  if (action === 'auth_link') {
    const linkType = String(body.linkType || 'recovery').trim();
    const email = String(body.email || existing.email || '').trim();
    if (!email) return json(400, { error: 'Email manquant' });
    const allowed = ['recovery', 'signup', 'magiclink', 'invite'];
    if (!allowed.includes(linkType)) return json(400, { error: 'Type de lien invalide' });
    const link = await generateAuthLink(email, linkType);
    if (!link) return json(502, { error: 'Lien non généré' });
    await writeAdminAudit('auth_link', { userId, linkType, email });
    return json(200, { ok: true, link, linkType });
  }

  return json(400, { error: 'Action inconnue' });
};
