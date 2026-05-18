const crypto = require('crypto');
const { verifySupabaseUser, buildCors, laboDataGet, laboDataUpsert } = require('./_labosync-auth');

const PBKDF2_ITERATIONS = 120000;

function hashPin(pin, salt) {
  return crypto.pbkdf2Sync(String(pin), String(salt), PBKDF2_ITERATIONS, 32, 'sha256').toString('hex');
}

function safeEqualHex(a, b) {
  try {
    const ba = Buffer.from(String(a), 'hex');
    const bb = Buffer.from(String(b), 'hex');
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch (_) {
    return false;
  }
}

function parseBody(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch (_) {
    return {};
  }
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
  const body = parseBody(event);
  const action = body.action || qs.action || '';

  try {
    if (event.httpMethod === 'GET' && action === 'status') {
      const row = await laboDataGet(user.id);
      const sec = row && row.data && row.data.adminAccess ? row.data.adminAccess : {};
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ hasPin: !!(sec.pinHash && sec.pinSalt) }),
      };
    }

    if (event.httpMethod === 'POST' && action === 'verify') {
      const pin = String(body.pin || '').trim();
      const row = await laboDataGet(user.id);
      const sec = row && row.data && row.data.adminAccess ? row.data.adminAccess : {};
      if (!sec.pinHash || !sec.pinSalt) {
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, noPin: true }) };
      }
      if (!pin) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Code requis' }) };
      }
      const hash = hashPin(pin, sec.pinSalt);
      const ok = safeEqualHex(hash, sec.pinHash);
      return { statusCode: 200, headers, body: JSON.stringify({ ok }) };
    }

    if (event.httpMethod === 'POST' && action === 'set') {
      const pin = String(body.pin || '').trim();
      const current = String(body.currentPin || '').trim();
      if (!/^\d{4,8}$/.test(pin)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Le code doit contenir 4 à 8 chiffres.' }),
        };
      }
      const row = await laboDataGet(user.id);
      const data = row && row.data && typeof row.data === 'object' ? Object.assign({}, row.data) : {};
      const sec = data.adminAccess && typeof data.adminAccess === 'object' ? data.adminAccess : {};
      if (sec.pinHash && sec.pinSalt) {
        if (!current) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Indiquez le code actuel.' }),
          };
        }
        const curHash = hashPin(current, sec.pinSalt);
        if (!safeEqualHex(curHash, sec.pinHash)) {
          return { statusCode: 403, headers, body: JSON.stringify({ error: 'Code actuel incorrect.' }) };
        }
      }
      const salt = crypto.randomBytes(16).toString('hex');
      data.adminAccess = {
        pinHash: hashPin(pin, salt),
        pinSalt: salt,
        updatedAt: new Date().toISOString(),
      };
      await laboDataUpsert(user.id, data);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'POST' && action === 'clear') {
      const current = String(body.currentPin || '').trim();
      const row = await laboDataGet(user.id);
      const data = row && row.data && typeof row.data === 'object' ? Object.assign({}, row.data) : {};
      const sec = data.adminAccess && typeof data.adminAccess === 'object' ? data.adminAccess : {};
      if (sec.pinHash && sec.pinSalt) {
        if (!current) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Indiquez le code actuel.' }),
          };
        }
        const curHash = hashPin(current, sec.pinSalt);
        if (!safeEqualHex(curHash, sec.pinHash)) {
          return { statusCode: 403, headers, body: JSON.stringify({ error: 'Code actuel incorrect.' }) };
        }
      }
      delete data.adminAccess;
      await laboDataUpsert(user.id, data);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Action non supportée' }) };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message || 'Erreur serveur' }),
    };
  }
};
