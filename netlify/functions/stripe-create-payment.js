const {
  buildCors,
  verifySupabaseUser,
  getStripeConnect,
  platformStripeSecret,
} = require('./_labosync-auth');

const SB_URL = 'https://ljnfpslgwgagdisixuxz.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

exports.handler = async (event) => {
  const headers = buildCors(event);

  try {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
    }

    const { factureId, factureNum, portalId, amount, cabName, description, appUrl, stripeSecretKey } = body;
    if (!factureId || !amount || !appUrl) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Données manquantes' }) };
    }

    const user = await verifySupabaseUser(event);
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: 'Connexion requise. Reconnectez-vous à Labosync puis réessayez.',
        }),
      };
    }

    const connect = await getStripeConnect(user.id);
    const connectedAccountId = connect && connect.stripeAccountId ? String(connect.stripeAccountId).trim() : '';

    const bodyKey = typeof stripeSecretKey === 'string' ? stripeSecretKey.trim() : '';
    const bodyKeyOk = bodyKey && /^sk_(live|test)_/.test(bodyKey) && bodyKey.length >= 20 && bodyKey.length <= 500;

    let stripeSecret = '';
    let stripeAccountHeader = null;

    if (connectedAccountId) {
      stripeSecret = platformStripeSecret();
      if (!stripeSecret) {
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({
            error: 'Stripe Connect plateforme non configuré (STRIPE_SUBSCRIPTION_KEY sur Netlify).',
          }),
        };
      }
      stripeAccountHeader = connectedAccountId;
    } else if (bodyKeyOk) {
      stripeSecret = bodyKey;
    } else {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          error:
            'Connectez votre compte Stripe dans Paramètres → Paiements en ligne. Les paiements de vos cabinets iront uniquement sur votre compte Stripe.',
          code: 'stripe_not_connected',
        }),
      };
    }

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

    function stripeHeaders() {
      const h = {
        Authorization: `Bearer ${stripeSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      if (stripeAccountHeader) h['Stripe-Account'] = stripeAccountHeader;
      return h;
    }

    if (stripeAccountHeader) {
      let acctResp;
      try {
        acctResp = await fetch(`https://api.stripe.com/v1/accounts/${encodeURIComponent(stripeAccountHeader)}`, {
          headers: stripeHeaders(),
        });
      } catch (fetchErr) {
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({ error: 'Impossible de contacter Stripe : ' + fetchErr.message }),
        };
      }
      const acct = await acctResp.json().catch(() => ({}));
      if (!acctResp.ok) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: acct.error?.message || 'Compte Stripe connecté inaccessible (HTTP ' + acctResp.status + ')',
          }),
        };
      }
      if (!acct.charges_enabled) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            error:
              'Votre compte Stripe n\'est pas encore prêt à encaisser. Ouvrez votre tableau de bord Stripe et terminez la configuration (identité, coordonnées bancaires).',
            code: 'stripe_charges_disabled',
          }),
        };
      }
    }

    const productName = String(description || `Facture ${factureNum || factureId}`).slice(0, 250);

    const priceParams = new URLSearchParams({
      currency: 'eur',
      unit_amount: String(amountCents),
      'product_data[name]': productName,
    });

    let priceResp;
    try {
      priceResp = await fetch('https://api.stripe.com/v1/prices', {
        method: 'POST',
        headers: stripeHeaders(),
        body: priceParams.toString(),
      });
    } catch (fetchErr) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Impossible de contacter Stripe : ' + fetchErr.message }),
      };
    }

    if (!priceResp.ok) {
      const err = await priceResp.json().catch(() => ({}));
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: err.error?.message || 'Erreur Stripe (Price — HTTP ' + priceResp.status + ')' }),
      };
    }

    const price = await priceResp.json();

    const successUrl = `${successBaseUrl}?stripe_ok=1&fid=${encodeURIComponent(factureId)}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = successBaseUrl;

    const sessionParams = new URLSearchParams({
      mode: 'payment',
      'line_items[0][price]': price.id,
      'line_items[0][quantity]': '1',
      success_url: successUrl,
      cancel_url: cancelUrl,
      'metadata[factureId]': factureId,
      'metadata[factureNum]': factureNum || '',
      'metadata[portalId]': portalId || '',
      'metadata[labUserId]': user.id,
    });
    if (cabName) {
      sessionParams.set('custom_text[submit][message]', `Paiement pour ${String(cabName).slice(0, 120)}`);
    }

    let sessionResp;
    try {
      sessionResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: stripeHeaders(),
        body: sessionParams.toString(),
      });
    } catch (fetchErr) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Impossible de contacter Stripe : ' + fetchErr.message }),
      };
    }

    if (!sessionResp.ok) {
      const err = await sessionResp.json().catch(() => ({}));
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: err.error?.message || 'Erreur Stripe (Checkout — HTTP ' + sessionResp.status + ')',
        }),
      };
    }

    const session = await sessionResp.json();
    if (!session.url) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Stripe n\'a pas retourné d\'URL de paiement.' }),
      };
    }

    if (SERVICE_KEY) {
      await fetch(`${SB_URL}/rest/v1/labo_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          id: `stripe_sess_${factureId}`,
          data: {
            factureId,
            factureNum,
            portalId,
            labUserId: user.id,
            stripeAccountId: stripeAccountHeader || null,
            status: 'pending',
            checkoutSessionId: session.id,
            paymentLinkUrl: session.url,
            createdAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        }),
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        url: session.url,
        sessionId: factureId,
        checkoutSessionId: session.id,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Erreur serveur lors de la création du paiement.' }),
    };
  }
};
