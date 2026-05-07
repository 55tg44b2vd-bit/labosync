exports.handler = async (event) => {
  const SB_URL = 'https://ljnfpslgwgagdisixuxz.supabase.co';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const STRIPE_SECRET_KEY = process.env.STRIPE_SUBSCRIPTION_KEY || process.env.STRIPE_SECRET_KEY;
  const PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY;
  const PRICE_ANNUAL = process.env.STRIPE_PRICE_ANNUAL;
  const TRIAL_DAYS = 14;

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

  if (!STRIPE_SECRET_KEY) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Clé Stripe non configurée sur le serveur' }) };
  if (!PRICE_MONTHLY || !PRICE_ANNUAL) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Prix Stripe non configurés (STRIPE_PRICE_MONTHLY / STRIPE_PRICE_ANNUAL)' }) };

  let body;
  try { body = JSON.parse(event.body); } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const { userId, email, plan, appUrl, laboName } = body;
  let appBaseUrl = '';
  try {
    const parsed = new URL(appUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('invalid protocol');
    appBaseUrl = `${parsed.origin}${parsed.pathname}`;
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'URL de retour invalide' }) };
  }
  if (!userId || !email || !plan || !appUrl) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Données manquantes (userId, email, plan, appUrl)' }) };
  }
  if (plan !== 'monthly' && plan !== 'annual') {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Plan invalide (monthly ou annual)' }) };
  }

  const priceId = plan === 'annual' ? PRICE_ANNUAL : PRICE_MONTHLY;
  const successUrl = `${appBaseUrl}?sub_ok=1&sid={CHECKOUT_SESSION_ID}`;
  const cancelUrl  = `${appBaseUrl}?sub_cancel=1`;

  // Récupérer ou créer le Customer Stripe via Supabase
  let customerId = '';
  if (SERVICE_KEY) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/labo_data?id=eq.sub_${userId}&select=data`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
      });
      const rows = await r.json();
      if (rows[0] && rows[0].data && rows[0].data.stripeCustomerId) customerId = rows[0].data.stripeCustomerId;
    } catch (e) { /* silencieux */ }
  }

  if (!customerId) {
    const custParams = new URLSearchParams({ email, 'metadata[userId]': userId });
    if (laboName) custParams.set('name', laboName);
    const custResp = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: custParams.toString(),
    });
    if (!custResp.ok) {
      const err = await custResp.json().catch(() => ({}));
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.error?.message || 'Erreur création Customer Stripe' }) };
    }
    const customer = await custResp.json();
    customerId = customer.id;
  }

  // Créer la Checkout Session en mode subscription avec 14 jours d'essai
  const params = new URLSearchParams({
    'mode': 'subscription',
    'customer': customerId,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'subscription_data[trial_period_days]': String(TRIAL_DAYS),
    'subscription_data[metadata][userId]': userId,
    'subscription_data[metadata][email]': email,
    'success_url': successUrl,
    'cancel_url': cancelUrl,
    'allow_promotion_codes': 'true',
    'metadata[userId]': userId,
    'metadata[plan]': plan,
  });

  let stripeResp;
  try {
    stripeResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
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

  // Enregistrer le customerId dès maintenant (avant même la fin du checkout)
  // En préservant les champs existants (notamment trialEndsAt initialisé au signup)
  if (SERVICE_KEY) {
    let existing = {};
    try {
      const r = await fetch(`${SB_URL}/rest/v1/labo_data?id=eq.sub_${userId}&select=data`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
      });
      const rows = await r.json();
      if (rows[0] && rows[0].data) existing = rows[0].data;
    } catch (e) {}

    await fetch(`${SB_URL}/rest/v1/labo_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: `sub_${userId}`,
        data: Object.assign({}, existing, {
          userId, email, laboName: laboName || existing.laboName || '',
          stripeCustomerId: customerId,
          status: 'checkout_pending',
          plan,
          checkoutSessionId: session.id,
          updatedAt: new Date().toISOString(),
        }),
        updated_at: new Date().toISOString(),
      }),
    });
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ url: session.url, sessionId: session.id, customerId }),
  };
};
