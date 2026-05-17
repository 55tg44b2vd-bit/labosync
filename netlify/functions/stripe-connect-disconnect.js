const { buildCors, verifySupabaseUser, saveStripeConnect } = require('./_labosync-auth');

exports.handler = async (event) => {
  const headers = buildCors(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  const user = await verifySupabaseUser(event);
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Connexion requise.' }) };
  }

  try {
    await saveStripeConnect(user.id, {
      stripeAccountId: null,
      disconnectedAt: new Date().toISOString(),
    });
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Déconnexion impossible.' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true }),
  };
};
