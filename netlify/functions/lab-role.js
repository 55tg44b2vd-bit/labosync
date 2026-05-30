const { buildCors, verifySupabaseUser, SB_URL } = require('./_labosync-auth');
const { normalizeRole, resolveLabRole, canManageRoles, VALID_ROLES } = require('./_labosync-rbac');

exports.handler = async (event) => {
  const headers = buildCors(event);
  headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  const SERVICE_KEY = (process.env.SUPABASE_SERVICE_KEY || '').trim();
  const user = await verifySupabaseUser(event);
  if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Connexion requise' }) };

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const action = String(body.action || 'get');

  if (action === 'get') {
    const role = resolveLabRole(user);
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, role, roles: VALID_ROLES }) };
  }

  if (action === 'set') {
    if (!canManageRoles(user)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Seul un administrateur peut modifier le rôle.', code: 'FORBIDDEN_ROLE' }),
      };
    }
    const role = normalizeRole(body.role);
    if (!SERVICE_KEY) {
      return { statusCode: 503, headers, body: JSON.stringify({ error: 'Configuration serveur incomplète' }) };
    }

    const meta = Object.assign({}, user.user_metadata || {}, { lab_role: role });
    const r = await fetch(SB_URL + '/auth/v1/admin/users/' + encodeURIComponent(user.id), {
      method: 'PUT',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: 'Bearer ' + SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_metadata: meta }),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Mise à jour rôle impossible', detail: txt.slice(0, 200) }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, role }) };
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: 'Action inconnue' }) };
};
