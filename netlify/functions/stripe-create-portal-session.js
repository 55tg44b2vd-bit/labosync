exports.handler = async (event) => {
  const SB_URL = 'https://ljnfpslgwgagdisixuxz.supabase.co';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const STRIPE_SECRET_KEY = process.env.STRIPE_SUBSCRIPTION_KEY || process.env.STRIPE_SECRET_KEY;

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const reqOrigin = event.headers.origin || event.headers.Origin || '';
  const allowOrigin = allowedOrigins.length
    ? (allowedOrigins.includes(reqOrigin) ? reqOrigin : allowedOrigins[0])
    : '*';
  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  if (!STRIPE_SECRET_KEY) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: 'Configuration Stripe manquante (STRIPE_SECRET_KEY ou STRIPE_SUBSCRIPTION_KEY)',
      }),
    };
  }

  let body;
  try { body = JSON.parse(event.body); } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const { userId, returnUrl } = body;
  let safeReturnUrl = '';
  try {
    const parsed = new URL(returnUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('invalid protocol');
    safeReturnUrl = `${parsed.origin}${parsed.pathname}`;
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'URL de retour invalide' }) };
  }
  if (!userId || !returnUrl) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Données manquantes' }) };
  }

  // Récupérer le stripeCustomerId
  let customerId = '';
  if (SERVICE_KEY) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/labo_data?id=eq.sub_${userId}&select=data`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
      });
      const rows = await r.json();
      if (rows[0] && rows[0].data && rows[0].data.stripeCustomerId) customerId = rows[0].data.stripeCustomerId;
    } catch (e) {}
  }

  if (!customerId) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Aucun abonnement trouvé — souscrivez d\'abord' }) };
  }

  const params = new URLSearchParams({ customer: customerId, return_url: safeReturnUrl });

  let stripeResp;
  try {
    stripeResp = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
  } catch (fetchErr) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Impossible de contacter Stripe : ' + fetchErr.message }) };
  }

  if (!stripeResp.ok) {
    const err = await stripeResp.json().catch(() => ({}));
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.error?.message || 'Erreur Stripe (HTTP ' + stripeResp.status + ')' }) };
  }

  const session = await stripeResp.json();
  return { statusCode: 200, headers, body: JSON.stringify({ url: session.url }) };
};
