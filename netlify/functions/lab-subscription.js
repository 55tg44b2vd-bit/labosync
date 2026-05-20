/**
 * Abonnement / essai labo — lecture et création via service role (évite reset d'essai côté client).
 */
const { verifySupabaseUser, buildCors, laboDataUpsert, SB_URL } = require('./_labosync-auth');

const TRIAL_DAYS = 14;

function parseBody(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch (_) {
    return null;
  }
}

async function readSubRow(userId) {
  const key = (process.env.SUPABASE_SERVICE_KEY || '').trim();
  if (!key) return null;
  const r = await fetch(
    `${SB_URL}/rest/v1/labo_data?id=eq.sub_${encodeURIComponent(userId)}&select=data,updated_at`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  if (!r.ok) return null;
  const rows = await r.json().catch(() => []);
  if (!rows[0] || !rows[0].data) return null;
  return { data: rows[0].data, updated_at: rows[0].updated_at || null };
}

function buildTrialRow(user) {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 86400000);
  return {
    userId: user.id,
    labUserId: user.id,
    email: user.email || '',
    status: 'trialing',
    trialStartedAt: now.toISOString(),
    trialEndsAt: trialEnd.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

exports.handler = async (event) => {
  const headers = buildCors(event);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const user = await verifySupabaseUser(event);
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Non authentifié' }) };
  }

  const qs = event.queryStringParameters || {};
  const body = parseBody(event) || {};
  const action = String(body.action || qs.action || 'status').trim();

  try {
    if (action === 'status' || action === 'ensure') {
      let row = await readSubRow(user.id);
      let created = false;

      if (!row || !row.data) {
        if (action === 'status') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ subscription: null, created: false }),
          };
        }
        const trial = buildTrialRow(user);
        await laboDataUpsert(`sub_${user.id}`, trial);
        row = { data: trial, updated_at: new Date().toISOString() };
        created = true;
      } else {
        const d = row.data;
        const patch = {};
        if (!d.labUserId) patch.labUserId = user.id;
        if (!d.userId) patch.userId = user.id;
        if (Object.keys(patch).length) {
          const next = Object.assign({}, d, patch, { updatedAt: new Date().toISOString() });
          await laboDataUpsert(`sub_${user.id}`, next);
          row = { data: next, updated_at: new Date().toISOString() };
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          subscription: row.data,
          created,
          serverUpdatedAt: row.updated_at,
        }),
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Action inconnue' }) };
  } catch (e) {
    console.error('lab-subscription', e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message || 'Erreur serveur' }) };
  }
};
