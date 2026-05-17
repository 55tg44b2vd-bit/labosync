const { buildCors, verifySupabaseUser, getStripeConnect } = require('./_labosync-auth');

exports.handler = async (event) => {
  const headers = buildCors(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  const user = await verifySupabaseUser(event);
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Connexion requise.' }) };
  }

  const data = await getStripeConnect(user.id);
  if (!data || !data.stripeAccountId) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        connected: false,
        stripeAccountId: null,
      }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      connected: true,
      stripeAccountId: data.stripeAccountId,
      livemode: !!data.livemode,
      connectedAt: data.connectedAt || null,
    }),
  };
};
