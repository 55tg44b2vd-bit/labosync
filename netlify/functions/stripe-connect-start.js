const {
  buildCors,
  verifySupabaseUser,
  signState,
  resolveConnectRedirectUri,
} = require('./_labosync-auth');

exports.handler = async (event) => {
  const headers = buildCors(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  const clientId = (process.env.STRIPE_CONNECT_CLIENT_ID || '').trim();
  if (!clientId) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: 'Stripe Connect non configuré (STRIPE_CONNECT_CLIENT_ID manquant sur Netlify).' }),
    };
  }

  const user = await verifySupabaseUser(event);
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Connexion requise.' }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const appUrl = String(body.appUrl || '').trim();
  if (!appUrl) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'appUrl manquant' }) };
  }

  const redirectUri = resolveConnectRedirectUri(appUrl);
  const state = signState({ userId: user.id, ts: Date.now(), appUrl });

  const url = new URL('https://connect.stripe.com/oauth/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('scope', 'read_write');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ url: url.toString() }),
  };
};
