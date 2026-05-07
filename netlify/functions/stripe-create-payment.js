exports.handler = async (event) => {
  const SB_URL = 'https://ljnfpslgwgagdisixuxz.supabase.co';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
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

  let body;
  try { body = JSON.parse(event.body); } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const { factureId, factureNum, portalId, amount, cabName, description, appUrl } = body;
  if (!factureId || !amount || !appUrl) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Données manquantes' }) };
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Clé Stripe non configurée' }) };
  let successBaseUrl = '';
  try {
    const parsed = new URL(appUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('invalid protocol');
    successBaseUrl = `${parsed.origin}${parsed.pathname}`;
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'URL de retour invalide' }) };
  }

  const amountCents = Math.round(parseFloat(amount) * 100);
  if (amountCents <= 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Montant invalide' }) };
  }

  // Étape 1 : créer un Price avec Product inline (Product auto-créé par Stripe)
  const priceParams = new URLSearchParams({
    'currency': 'eur',
    'unit_amount': String(amountCents),
    'product_data[name]': description || `Facture ${factureNum || factureId}`,
  });

  let priceResp;
  try {
    priceResp = await fetch('https://api.stripe.com/v1/prices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: priceParams.toString(),
    });
  } catch (fetchErr) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Impossible de contacter Stripe : ' + fetchErr.message }) };
  }

  if (!priceResp.ok) {
    const err = await priceResp.json().catch(() => ({}));
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.error?.message || 'Erreur Stripe (Price — HTTP ' + priceResp.status + ')' }) };
  }

  const price = await priceResp.json();

  // Étape 2 : créer un Payment Link (pas d'expiration — reste valide indéfiniment)
  const successUrl = `${successBaseUrl}?stripe_ok=1&fid=${encodeURIComponent(factureId)}`;

  const linkParams = new URLSearchParams({
    'line_items[0][price]': price.id,
    'line_items[0][quantity]': '1',
    'after_completion[type]': 'redirect',
    'after_completion[redirect][url]': successUrl,
    'metadata[factureId]': factureId,
    'metadata[factureNum]': factureNum || '',
    'metadata[portalId]': portalId || '',
    'payment_intent_data[metadata][factureId]': factureId,
  });
  if (cabName) {
    linkParams.set('custom_text[submit][message]', `Paiement pour ${cabName}`);
  }

  let linkResp;
  try {
    linkResp = await fetch('https://api.stripe.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: linkParams.toString(),
    });
  } catch (fetchErr) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Impossible de contacter Stripe : ' + fetchErr.message }) };
  }

  if (!linkResp.ok) {
    const err = await linkResp.json().catch(() => ({}));
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.error?.message || 'Erreur Stripe (Payment Link — HTTP ' + linkResp.status + ')' }) };
  }

  const link = await linkResp.json();

  // Stocker la session en attente dans Supabase — clé : factureId (pas l'ID Stripe)
  // Le webhook écrit aussi keyé par factureId via metadata → match garanti
  if (SERVICE_KEY) {
    await fetch(`${SB_URL}/rest/v1/labo_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: `stripe_sess_${factureId}`,
        data: {
          factureId, factureNum, portalId,
          status: 'pending',
          paymentLinkId: link.id,
          paymentLinkUrl: link.url,
          createdAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      }),
    });
  }

  // Retourne factureId comme "sessionId" pour que le polling client matche la clé
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ url: link.url, sessionId: factureId, paymentLinkId: link.id }),
  };
};
